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

export type EpisodeSummaryProps = {
  podcastName: string;
  episodeTitle: string;
  episodeUrl: string;
  keyTopics: string;
  marketSignals: string;
  actionableInsights: string;
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

const body = { color: "#ededed", fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-line" as const };

export function EpisodeSummary({
  podcastName,
  episodeTitle,
  episodeUrl,
  keyTopics,
  marketSignals,
  actionableInsights,
}: EpisodeSummaryProps) {
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
            {podcastName}
          </Text>

          <Section>
            <Text style={sectionLabel}>Key topics</Text>
            <Text style={body}>{keyTopics}</Text>

            <Text style={sectionLabel}>Market &amp; price signals</Text>
            <Text style={body}>{marketSignals}</Text>

            <Text style={sectionLabel}>Actionable insights</Text>
            <Text style={body}>{actionableInsights}</Text>
          </Section>

          <Section style={{ marginTop: "32px" }}>
            <Link href={episodeUrl} style={{ color: "#F7931A", fontSize: "14px" }}>
              Read the full summary →
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default EpisodeSummary;
