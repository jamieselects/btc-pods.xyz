import {
  Body,
  Container,
  Head,
  Heading,
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
  marketSignals: string;
  actionableInsights: string;
  sponsorships: string;
};

const main = {
  backgroundColor: "#0a0a0a",
  color: "#ededed",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "32px 24px",
  maxWidth: "560px",
};

const sectionLabel = {
  color: "#F7931A",
  fontSize: "12px",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  margin: "24px 0 8px",
};

const linkRow = {
  color: "#ededed",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "12px 0 0",
} as const;

export function EpisodeSummary({
  podcastName,
  episodeTitle,
  episodeUrl,
  listenUrl,
  keyTopics,
  marketSignals,
  actionableInsights,
  sponsorships,
}: EpisodeSummaryProps) {
  const listen = (listenUrl?.trim() || episodeUrl).trim();
  const summaryPage = episodeUrl.trim();
  const showSeparateSummaryLink = listen !== summaryPage;

  return (
    <Html>
      <Head />
      <Preview>{`${podcastName} — ${episodeTitle}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={{ color: "#F7931A", fontFamily: "monospace", fontSize: "12px", letterSpacing: "0.12em", margin: 0 }}>
            ₿ BTC POD SUMMARIES
          </Text>
          <Heading as="h1" style={{ fontSize: "22px", margin: "8px 0 4px" }}>
            {episodeTitle}
          </Heading>
          <Text style={{ color: "#a1a1a1", fontSize: "13px", margin: 0 }}>
            from {podcastName}
          </Text>

          {sponsorships.trim() ? (
            <Section style={{ marginTop: "20px" }}>
              <Text style={{ ...sectionLabel, marginTop: 0 }}>
                Episode sponsorships
              </Text>
              <SponsorshipEmailLines text={sponsorships} />
            </Section>
          ) : null}

          <Text style={linkRow}>
            {showSeparateSummaryLink ? (
              <>
                <Link
                  href={listen}
                  style={{ color: "#F7931A", textDecoration: "underline" }}
                >
                  Listen to this episode
                </Link>
                {" · "}
                <Link
                  href={summaryPage}
                  style={{ color: "#F7931A", textDecoration: "underline" }}
                >
                  Full summary &amp; transcript
                </Link>
              </>
            ) : (
              <Link
                href={summaryPage}
                style={{ color: "#F7931A", textDecoration: "underline" }}
              >
                Full summary &amp; transcript
              </Link>
            )}
          </Text>

          <Section>
            <Text style={sectionLabel}>Key topics</Text>
            <SummarySectionBody text={keyTopics} />

            <Text style={sectionLabel}>Market &amp; price signals</Text>
            <SummarySectionBody text={marketSignals} />

            <Text style={sectionLabel}>Actionable insights</Text>
            <SummarySectionBody text={actionableInsights} />
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default EpisodeSummary;
