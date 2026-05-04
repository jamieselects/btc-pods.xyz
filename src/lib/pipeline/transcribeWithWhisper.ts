import "server-only";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { stat, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import OpenAI from "openai";
import ffmpegStatic from "ffmpeg-static";
import { env, hasEnv } from "@/lib/env";

/** OpenAI accepts up to 25 MB per file. Compress before crossing the threshold. */
export const WHISPER_FILE_LIMIT_BYTES = 25 * 1024 * 1024;
/** Aim for a comfortable margin under the hard limit when compressing. */
const WHISPER_TARGET_BYTES = 24 * 1024 * 1024;
/** Hard ceiling on the raw audio download to protect /tmp + memory. */
const MAX_AUDIO_DOWNLOAD_BYTES = 250 * 1024 * 1024;
/** Skip anything over 3 hours — speaks too long, costs too much, and rarely fits. */
export const MAX_DURATION_SECONDS = 3 * 60 * 60;
const FETCH_TIMEOUT_MS = 120_000;

/** Whisper-1 supports `verbose_json` (which we need for `duration`). */
export const WHISPER_MODEL = "whisper-1";

export type WhisperResult =
  | { status: "ok"; text: string; durationSeconds: number }
  | { status: "skipped"; reason: string };

/**
 * Download podcast audio, optionally compress it, and run OpenAI Whisper.
 *
 * The pipeline:
 *   1. Skip up-front if the RSS-declared duration is over 3 hours.
 *   2. Stream the audio file to /tmp with a 250 MB safety cap.
 *   3. If the file exceeds Whisper's 25 MB limit, re-encode to mono 16 kHz
 *      Opus at 16 kbps via ffmpeg-static (keeps a 3-hour episode well under).
 *   4. Send the (possibly compressed) file to Whisper, ask for `verbose_json`
 *      so we can capture the actual duration for cost reporting.
 *   5. Always clean up tmp files, even on error.
 */
export async function transcribeWithWhisper(opts: {
  audioUrl: string;
  durationSeconds: number | null;
}): Promise<WhisperResult> {
  if (!hasEnv("OPENAI_API_KEY")) {
    return { status: "skipped", reason: "OPENAI_API_KEY is not set" };
  }
  if (
    opts.durationSeconds !== null &&
    opts.durationSeconds > MAX_DURATION_SECONDS
  ) {
    return {
      status: "skipped",
      reason: `episode duration ${opts.durationSeconds}s exceeds ${MAX_DURATION_SECONDS}s cap`,
    };
  }

  const tmpFiles: string[] = [];

  try {
    const downloaded = await downloadAudio(opts.audioUrl);
    if (downloaded.status !== "ok") return downloaded;
    tmpFiles.push(downloaded.path);

    let pathToSend = downloaded.path;
    const downloadedSize = (await stat(downloaded.path)).size;

    if (downloadedSize > WHISPER_FILE_LIMIT_BYTES) {
      try {
        const compressed = await compressForWhisper(downloaded.path);
        tmpFiles.push(compressed);
        pathToSend = compressed;
        const compressedSize = (await stat(compressed)).size;
        if (compressedSize > WHISPER_FILE_LIMIT_BYTES) {
          return {
            status: "skipped",
            reason: `compressed audio still too large (${compressedSize} bytes)`,
          };
        }
      } catch (err) {
        return {
          status: "skipped",
          reason:
            err instanceof Error
              ? `ffmpeg compression failed: ${err.message}`
              : "ffmpeg compression failed",
        };
      }
    }

    const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    const transcription = await client.audio.transcriptions.create({
      file: createReadStream(pathToSend),
      model: WHISPER_MODEL,
      response_format: "verbose_json",
    });

    const durationSeconds =
      transcription.duration ?? opts.durationSeconds ?? 0;

    if (durationSeconds > MAX_DURATION_SECONDS) {
      return {
        status: "skipped",
        reason: `whisper-reported duration ${durationSeconds}s exceeds cap`,
      };
    }

    const text = transcription.text?.trim();
    if (!text) {
      return { status: "skipped", reason: "whisper returned empty transcript" };
    }

    return { status: "ok", text, durationSeconds };
  } catch (err) {
    return {
      status: "skipped",
      reason:
        err instanceof Error
          ? `whisper transcription failed: ${err.message}`
          : "whisper transcription failed",
    };
  } finally {
    await Promise.allSettled(tmpFiles.map((p) => unlink(p)));
  }
}

type DownloadResult =
  | { status: "ok"; path: string }
  | { status: "skipped"; reason: string };

async function downloadAudio(url: string): Promise<DownloadResult> {
  let res: Response;
  try {
    res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: "follow",
      headers: {
        "User-Agent": "btc-pod-summaries/1.0 (whisper transcription)",
        Accept: "audio/*,*/*;q=0.5",
      },
    });
  } catch (err) {
    return {
      status: "skipped",
      reason:
        err instanceof Error
          ? `audio fetch failed: ${err.message}`
          : "audio fetch failed",
    };
  }

  if (!res.ok) {
    return { status: "skipped", reason: `audio fetch HTTP ${res.status}` };
  }
  if (!res.body) {
    return { status: "skipped", reason: "audio response missing body" };
  }

  const declared = Number(res.headers.get("content-length") ?? "0");
  if (declared > MAX_AUDIO_DOWNLOAD_BYTES) {
    return {
      status: "skipped",
      reason: `audio too large (${declared} bytes, cap ${MAX_AUDIO_DOWNLOAD_BYTES})`,
    };
  }

  const ext = guessExtension(url, res.headers.get("content-type"));
  const filePath = path.join(tmpdir(), `pod-${randomUUID()}${ext}`);

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_AUDIO_DOWNLOAD_BYTES) {
        await reader.cancel();
        return {
          status: "skipped",
          reason: `audio exceeded ${MAX_AUDIO_DOWNLOAD_BYTES}-byte download cap`,
        };
      }
      chunks.push(value);
    }
  } catch (err) {
    return {
      status: "skipped",
      reason:
        err instanceof Error
          ? `audio stream read failed: ${err.message}`
          : "audio stream read failed",
    };
  }

  await writeFile(filePath, Buffer.concat(chunks));
  return { status: "ok", path: filePath };
}

/**
 * Re-encode to mono 16 kHz Opus at 16 kbps. A 3-hour podcast lands around
 * ~22 MB, well below Whisper's 25 MB limit, while still being intelligible.
 */
function compressForWhisper(inputPath: string): Promise<string> {
  if (!ffmpegStatic) {
    return Promise.reject(
      new Error(`ffmpeg-static binary unavailable for ${process.platform}/${process.arch}`),
    );
  }

  const outputPath = path.join(tmpdir(), `pod-${randomUUID()}.ogg`);
  const args = [
    "-hide_banner",
    "-loglevel",
    "error",
    "-i",
    inputPath,
    "-vn",
    "-ac",
    "1",
    "-ar",
    "16000",
    "-c:a",
    "libopus",
    "-application",
    "voip",
    "-b:a",
    "16k",
    "-y",
    outputPath,
  ];

  return new Promise<string>((resolve, reject) => {
    const proc = spawn(ffmpegStatic as string, args, {
      stdio: ["ignore", "ignore", "pipe"],
    });
    let stderr = "";
    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
      // Cap stderr buffer to avoid runaway memory if ffmpeg goes off the rails.
      if (stderr.length > 8192) stderr = stderr.slice(-8192);
    });
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) {
        resolve(outputPath);
      } else {
        reject(
          new Error(
            `ffmpeg exit ${code}${stderr ? `: ${stderr.trim().slice(-500)}` : ""}`,
          ),
        );
      }
    });
  });
}

function guessExtension(url: string, contentType: string | null): string {
  const fromUrl = path.extname(new URL(url).pathname).toLowerCase();
  if (/^\.(mp3|m4a|mp4|wav|ogg|oga|webm|flac|mpga|mpeg)$/.test(fromUrl)) {
    return fromUrl;
  }
  const ct = (contentType ?? "").toLowerCase();
  if (ct.includes("mpeg")) return ".mp3";
  if (ct.includes("mp4") || ct.includes("m4a") || ct.includes("aac")) return ".m4a";
  if (ct.includes("wav")) return ".wav";
  if (ct.includes("ogg")) return ".ogg";
  if (ct.includes("webm")) return ".webm";
  if (ct.includes("flac")) return ".flac";
  // Default: trust the upstream and let ffmpeg / whisper sniff the format.
  return ".audio";
}

/** Tiny test seam — exported so unit tests can sanity-check the cap. */
export const _internal = {
  WHISPER_FILE_LIMIT_BYTES,
  WHISPER_TARGET_BYTES,
  MAX_AUDIO_DOWNLOAD_BYTES,
};
