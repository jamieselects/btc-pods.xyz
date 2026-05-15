import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { SponsorshipEmailLines } from "@/emails/SponsorshipEmailLines";
import { SummarySectionBody } from "@/emails/SummarySectionBody";

export type EpisodeSummaryProps = {
  podcastName: string;
  episodeTitle: string;
  episodeUrl: string;
  listenUrl: string | null;
  keyTopics: string;
  /** Retained for API compatibility; no longer rendered. */
  marketSignals: string;
  /** Retained for API compatibility; no longer rendered. */
  actionableInsights: string;
  sponsorships: string;
  unsubscribeUrl?: string;
};

// ── Hardcoded design tokens (CSS custom properties don't survive email clients) ──
const C = {
  bg: "#0a0a0a",
  ink: "#ededed",
  ink2: "#c8c6bf",
  ink3: "#a1a1a1",
  ink4: "#6e6e68",
  rule: "#1e1e1e",
  accent: "#F7931A",
  accentOn: "#0a0a0a",
} as const;

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function EpisodeSummary({
  podcastName,
  episodeTitle,
  episodeUrl,
  listenUrl,
  keyTopics,
  sponsorships,
  unsubscribeUrl,
}: EpisodeSummaryProps) {
  const listen = (listenUrl?.trim() || episodeUrl).trim();
  const summaryPage = episodeUrl.trim();
  const podcastSlug = slugify(podcastName);

  return (
    <Html>
      <Head />
      <Preview>{`${podcastName} — ${episodeTitle}`}</Preview>
      <Body style={{ backgroundColor: C.bg, color: C.ink, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, sans-serif", margin: 0 }}>
        <Container style={{ margin: "0 auto", padding: "36px 28px", maxWidth: "560px" }}>

          {/* ── Masthead ── */}
          <Text style={{ margin: "0 0 28px", lineHeight: 1 }}>
            <span style={{ color: C.accent, fontSize: "18px", fontWeight: 700 }}>₿</span>
            {" "}
            <span style={{ color: C.ink2, fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase" }}>
              BTC Pod Summaries
            </span>
          </Text>

          {/* ── Episode card ── */}
          <Text style={{ color: C.ink3, fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>
            From{" "}
            <Link
              href={`https://btcpods.xyz/podcasts/${podcastSlug}`}
              style={{ color: C.ink2, fontWeight: 500, textDecoration: "underline", textDecorationColor: C.accent }}
            >
              {podcastName}
            </Link>
          </Text>

          <Heading
            as="h1"
            style={{ fontSize: "26px", lineHeight: "1.2", letterSpacing: "-0.015em", fontWeight: 600, color: C.ink, margin: "0 0 18px" }}
          >
            {episodeTitle}
          </Heading>

          {/* ── Pill CTAs ── */}
          <Text style={{ margin: "0 0 0" }}>
            <Link
              href={listen}
              style={{
                background: C.accent,
                color: C.accentOn,
                padding: "8px 14px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: 500,
                textDecoration: "none",
                display: "inline-block",
                letterSpacing: "0.01em",
                marginRight: "8px",
              }}
            >
              Listen ↗
            </Link>
            <Link
              href={summaryPage}
              style={{
                color: C.ink2,
                border: `1px solid ${C.rule}`,
                padding: "8px 14px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: 500,
                textDecoration: "none",
                display: "inline-block",
                letterSpacing: "0.01em",
              }}
            >
              Full summary &amp; transcript
            </Link>
          </Text>

          {/* ── Section: Key topics ── */}
          <Section style={{ marginTop: "40px" }}>
            <Hr style={{ border: "none", borderTop: `1px solid ${C.rule}`, margin: "0 0 14px" }} />
            <Heading as="h2" style={{ margin: "0 0 22px", fontSize: "19px", fontWeight: 600, color: C.ink, letterSpacing: "-0.005em" }}>
              Key topics
            </Heading>
            <SummarySectionBody text={keyTopics} />
          </Section>

          {/* ── Section: Episode Sponsors (only if present) ── */}
          {sponsorships.trim() ? (
            <Section style={{ marginTop: "40px" }}>
              <Hr style={{ border: "none", borderTop: `1px solid ${C.rule}`, margin: "0 0 14px" }} />
              <Text
                style={{
                  margin: "0 0 8px",
                  fontSize: "19px",
                  fontWeight: 600,
                  color: C.ink,
                  letterSpacing: "-0.005em",
                }}
              >
                Episode Sponsors
              </Text>
              <Text style={{ margin: "0 0 22px", fontSize: "12px", color: C.ink4, lineHeight: "1.5" }}>
                Paid placements in this episode. Support the show by checking out their sponsors!
              </Text>
              <SponsorshipEmailLines text={sponsorships} />
            </Section>
          ) : null}

          {/* ── Footer ── */}
          <Section style={{ marginTop: "48px" }}>
            <Hr style={{ border: "none", borderTop: `1px solid ${C.rule}`, margin: "0 0 18px" }} />
            <Text style={{ margin: 0, fontSize: "11.5px", lineHeight: "1.6", color: C.ink4 }}>
              <span>btcpods.xyz · daily summaries, no fluff</span>
              {unsubscribeUrl ? (
                <>
                  {"  "}
                  <Link href={unsubscribeUrl} style={{ color: C.ink3, textDecoration: "underline" }}>
                    Unsubscribe
                  </Link>
                </>
              ) : null}
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

export default EpisodeSummary;
