#!/usr/bin/env python3
"""
Generate supabase/migrations/007_feedspot_bitcoin_podcasts.sql from
uploads/bitcoin_podcasts-0.md (FeedSpot export). Validates RSS URLs,
blocks feeds already seeded in 002 / 004, and fills `description` from
each show's RSS channel summary when available (otherwise NULL).
"""

from __future__ import annotations

import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MD = ROOT / "uploads" / "bitcoin_podcasts-0.md"
CURSOR_MD = (
    ROOT.parent
    / ".cursor"
    / "projects"
    / "Users-jamie-Development-btc-pod-summaries"
    / "uploads"
    / "bitcoin_podcasts-0.md"
)

OUT = ROOT / "supabase/migrations/007_feedspot_bitcoin_podcasts.sql"

HEADERS = {"User-Agent": "btc-pod-ingest-feedspot/1"}
STOP = frozenset(
    {
        "the",
        "a",
        "an",
        "and",
        "podcast",
        "show",
        "for",
        "with",
        "live",
        "video",
        "audio",
        "formerly",
        "lets",
        "talk",
    },
)


def norm_feed(url: str) -> str:
    u = url.rstrip("/").lower()
    if "1849151" in u and "buzzsprout.com" in u:
        return "https://feeds.buzzsprout.com/1849151.rss"
    if "2334006" in u and "buzzsprout.com" in u:
        return "https://feeds.buzzsprout.com/2334006.rss"
    return u


# Already present in migrations 002 / 004 (normalize for comparison)
_BLOCKED_RAW = """
https://feeds.fountain.fm/UZSKQcrOnhqYS1JopxGg
https://anchor.fm/s/7d083a4/podcast/rss
https://feed.podbean.com/thehurdleratepod/feed.xml
https://feeds.buzzsprout.com/1849151.rss
https://rss.buzzsprout.com/1849151.rss
https://anchor.fm/s/e29097f4/podcast/rss
https://coinstories.libsyn.com/rss
https://anchor.fm/s/b4841110/podcast/rss
https://feeds.fountain.fm/ZwwaDULvAj0yZvJ5kdB9
https://feed.podbean.com/mauriziopedrazzoligrazioli/feed.xml
https://anchor.fm/s/e01a5d48/podcast/rss
https://feeds.buzzsprout.com/2334006.rss
https://rss.buzzsprout.com/2334006.rss
"""
BLOCKED_FEED_NORM = {norm_feed(x.strip()) for x in _BLOCKED_RAW.split() if x.strip()}

EXISTING_SLUGS = frozenset(
    {
        "what-bitcoin-did",
        "stephan-livera-podcast",
        "the-hurdle-rate",
        "bitcoin-standard-podcast",
        "the-jack-mallers-show",
        "coin-stories",
        "the-pomp-podcast",
        "tftc",
        "mr-m-podcast",
        "onramp",
        "the-bitcoin-way-podcast",
    }
)

SKIP_TITLES = frozenset(
    {"Coin Mastery Podcast", "BTCTC: From Bars To Bitcoin Project"}
)

# Exact RSS replacements where Apple search alone is flaky
TITLE_TO_RSS: dict[str, str] = {
    "Magic Internet Money": "https://magicinternetmoney.libsyn.com/rss",
    "Bitcoin Terminal value": "https://rss.buzzsprout.com/1318159.rss",
    "Relai Bitcoin Podcast": "https://anchor.fm/s/42c63e90/podcast/rss",
    "THE Bitcoin Podcast": "https://feeds.fountain.fm/VV0f6IwusQoi5kOqvNCx",
    "gm from Decrypt": "https://feeds.acast.com/public/shows/61aa589af86cba0013562429",
    # Apple search confuses this with unrelated “Building on a Bitcoin Standard” shows.
    "Built on Bitcoin with Jacob Brown": "https://anchor.fm/s/10604ca98/podcast/rss",
}


def load_titles(md_path: Path) -> list[str]:
    pat = re.compile(r"^###\s+\d+\\\.\s*(.+?)\s*$", re.MULTILINE)
    txt = md_path.read_text(encoding="utf-8")
    return [m.group(1).strip() for m in pat.finditer(txt)]


def slugify(title: str) -> str:
    s = title.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return (s.strip("-")[:96].rstrip("-")) or "podcast"


def key_tokens(title: str) -> list[str]:
    base = title.lower().split("formerly")[0]
    words = re.findall(r"[a-z0-9]+", base.replace("bitcoin", " bitcoin "))
    return [w for w in words if len(w) > 2 and w not in STOP][:14]


def overlap_score(feedspot_title: str, collection_name: str) -> float:
    qs = set(key_tokens(feedspot_title))
    ns = set(re.findall(r"[a-z0-9]+", collection_name.lower()))
    if not qs:
        return 0.62
    return len(qs & ns) / len(qs)


def itunes_search(term: str, limit: int = 14) -> list[dict]:
    q = urllib.parse.quote(term[:200])
    url = f"https://itunes.apple.com/search?term={q}&entity=podcast&limit={limit}"
    for attempt in range(6):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=35) as r:
                j = json.loads(r.read().decode())
            return list(j.get("results") or [])
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(5 + attempt * 5)
                continue
            raise
    return []


def feed_ok(url: str) -> bool:
    try:
        req = urllib.request.Request(
            url,
            headers={**HEADERS, "Accept": "application/rss+xml,application/xml,text/xml,*/*"},
        )
        with urllib.request.urlopen(req, timeout=30) as r:
            r.read(140000)
        return True
    except Exception:
        return False


def pick(feedspot_title: str) -> tuple[str | None, str | None, str | None, str | None]:
    locked_name: str | None = None
    locked_art: str | None = None
    locked_artist: str | None = None

    rss_manual = TITLE_TO_RSS.get(feedspot_title)
    rss: str | None = None
    if rss_manual:
        if feed_ok(rss_manual):
            rss = rss_manual
            locked_hits = itunes_search(feedspot_title, limit=14)
            for cand in locked_hits:
                if cand.get("feedUrl") and norm_feed(cand["feedUrl"]) == norm_feed(rss):
                    locked_name = cand.get("collectionName")
                    locked_art = cand.get("artworkUrl600") or cand.get("artworkUrl100")
                    locked_artist = (cand.get("artistName") or "").strip() or locked_artist
                    break
            if not locked_name and feedspot_title == "gm from Decrypt":
                locked_name = "Decrypt News"

    if not rss:
        time.sleep(1.95)
        j = itunes_search(feedspot_title, limit=14)
        best_sc = -1.0
        winner: dict | None = None
        tl = feedspot_title.lower()

        for cand in j:
            fu = cand.get("feedUrl") or ""
            cn = cand.get("collectionName") or ""
            if not fu:
                continue
            if norm_feed(fu) in BLOCKED_FEED_NORM:
                continue

            # Bitcoin Cash still allowed (FeedSpot list); keep strict match threshold
            if "coin mastery" in tl:
                if "coin mastery" not in cn.lower():
                    continue

            if "bitcoin terminal value" in tl or (
                "bitcoin terminal" in tl and "value" in tl.split()
            ):
                if ("terminal" not in cn.lower()) and ("value" not in cn.lower()):
                    continue
                if "bitcoin" not in cn.lower():
                    continue

            if tl.strip() == "the bitcoin path":
                if "bitcoin path" not in cn.lower().replace(",", ""):
                    continue

            if tl.strip() == "the path to bitcoin":
                if "path to bitcoin" not in cn.lower():
                    continue

            # Broad crypto shows mention bitcoin but wrong brand
            if "decrypt" in cn.lower() and "gm" not in tl and "decrypt" not in tl:
                continue

            sc = overlap_score(feedspot_title, cn)

            minimum = max(
                min(2.85 / max(len(key_tokens(feedspot_title)), 1), 0.9), 0.44
            )
            if tl.startswith("bitcoin & markets"):
                minimum = 0.38
            if sc < minimum:
                continue

            if sc > best_sc:
                best_sc = sc
                winner = cand

        if winner:
            rss = winner.get("feedUrl")
            locked_name = winner.get("collectionName")
            locked_art = winner.get("artworkUrl600") or winner.get("artworkUrl100")
            locked_artist = (winner.get("artistName") or "").strip() or locked_artist
        else:
            return None, None, None, None

    assert rss
    nf = norm_feed(rss)
    if nf in BLOCKED_FEED_NORM:
        return None, None, None, None

    nm = locked_name or feedspot_title

    art = locked_art
    if not art:
        for cand in itunes_search(nm, limit=12):
            if cand.get("feedUrl") and norm_feed(cand["feedUrl"]) == nf:
                art = cand.get("artworkUrl600") or cand.get("artworkUrl100")
                nm = cand.get("collectionName") or nm
                locked_artist = locked_artist or (cand.get("artistName") or "").strip()
                break

    return rss, nm, art, locked_artist or None


def sql_escape(s: str) -> str:
    return s.replace("'", "''")


def rss_channel_description(feed_url: str) -> str | None:
    """First meaningful channel summary from RSS / Atom (no extra deps)."""
    import html as html_module
    import re
    import urllib.error
    import urllib.request

    req = urllib.request.Request(
        feed_url,
        headers={"User-Agent": "btc-pod-ingest-feedspot/1"},
    )
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
    except (urllib.error.URLError, TimeoutError, OSError):
        return None

    for pat in (
        r"<itunes:summary>\s*<!\[CDATA\[(.*?)\]\]>\s*</itunes:summary>",
        r"<itunes:summary>\s*(.*?)\s*</itunes:summary>",
        r"<description>\s*<!\[CDATA\[(.*?)\]\]>\s*</description>",
        r"<description>\s*(.*?)\s*</description>",
    ):
        m = re.search(pat, raw, re.DOTALL | re.IGNORECASE)
        if not m:
            continue
        text = m.group(1).strip()
        text = re.sub(r"<[^>]+>", " ", text)
        text = html_module.unescape(text)
        text = re.sub(r"\s+", " ", text).strip()
        if len(text) < 12:
            continue
        return text[:4000]
    return None


def chunk_row(
    slug: str, name: str, tagline: str | None, rss: str, desc: str | None
) -> str:
    desc_sql = "null"
    if desc:
        desc_sql = "'" + sql_escape(desc) + "'"
    ts = "null"
    if tagline:
        ts = "'" + sql_escape(tagline[:220]) + "'"
    return (
        "(\n"
        f"  '{sql_escape(slug)}',\n"
        f"  '{sql_escape(name)}',\n"
        f"  {ts},\n"
        f"  {desc_sql},\n"
        f"  '{sql_escape(rss)}',\n"
        "  null,\n"
        "  false, true, true,\n"
        "  null,\n"
        "  'weekly', 'intermediate',\n"
        "  array['bitcoin']::text[],\n"
        "  null\n"
        ")"
    )


def cover(slug: str, img: str) -> str:
    u = img.replace("/100x100", "/600x600") if "/100x100" in img else img
    return (
        "update public.podcasts\n"
        f"set cover_image_url = '{sql_escape(u)}'\n"
        f"where slug = '{sql_escape(slug)}';\n\n"
    )


def main() -> None:
    md_path = CURSOR_MD if CURSOR_MD.is_file() else DEFAULT_MD
    if not md_path.is_file():
        raise SystemExit(f"Missing FeedSpot export markdown at {CURSOR_MD} or {DEFAULT_MD}")

    rows: list[dict] = []
    seen_nf: set[str] = set()
    slug_hits: dict[str, int] = {}

    for tit in load_titles(md_path):
        if tit in SKIP_TITLES:
            continue
        rss, name, img, artist = pick(tit)
        if not rss or not name:
            continue

        nf = norm_feed(rss)
        if nf in seen_nf or nf in BLOCKED_FEED_NORM:
            continue
        seen_nf.add(nf)

        slug = slugify(name)
        slug_hits[slug] = slug_hits.get(slug, 0) + 1
        if slug_hits[slug] > 1:
            slug = f"{slug}-{slug_hits[slug]}"
        if slug in EXISTING_SLUGS:
            continue

        channel_desc = rss_channel_description(rss)
        time.sleep(0.12)

        rows.append(
            {
                "slug": slug,
                "name": name,
                "tagline": artist or "",
                "rss": rss,
                "art": img,
                "desc": channel_desc,
            }
        )

    parts = [
        "-- FeedSpot bitcoin podcast directory (April 2026 export).\n"
        "-- Source: https://podcast.feedspot.com/bitcoin_podcasts/\n",
        "-- Feeds validated via GET; overlaps with podcasts in migrations 002/004 excluded.\n\n",
        "insert into public.podcasts (\n",
        "  slug, name, tagline, description, rss_url, website_url,\n",
        "  has_transcript_in_rss, is_curated, is_active, year_started,\n",
        "  publishing_frequency, difficulty_level, tags, twitter_handle\n",
        ") values\n",
        ",\n".join(
            chunk_row(
                r["slug"],
                r["name"],
                r["tagline"] or None,
                r["rss"],
                r.get("desc"),
            )
            for r in rows
        ),
        "\non conflict (slug) do nothing;\n\n",
    ]
    cov = "".join(cover(r["slug"], r["art"]) for r in rows if r.get("art"))
    OUT.write_text("".join(parts) + cov, encoding="utf-8")
    print(f"{OUT} — {len(rows)} podcasts")


if __name__ == "__main__":
    main()
