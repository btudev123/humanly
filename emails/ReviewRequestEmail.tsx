import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

/**
 * `[NEEDS DATA: Humanly's registered postal address.]`
 *
 * CAN-SPAM (US) and CASL (CA) both require a valid physical postal address in commercial email,
 * and this is the one email this codebase sends that is commercial rather than transactional
 * (`docs/lifecycle/2026-09-review-request-sequence.md` §3). Nobody in this repo has that address
 * and it is not something to guess — a wrong address is worse than an obvious placeholder, so
 * the placeholder is deliberately unmissable and renders in the footer as-is.
 *
 * To fix: replace the string below with Karma's registered business address. `sendReviewRequest`
 * (`lib/email/resend.tsx`) logs a warning on every send while it is still a placeholder.
 */
export const REVIEW_EMAIL_POSTAL_ADDRESS =
  "[NEEDS DATA — Humanly postal address not yet supplied]";

/** False while `REVIEW_EMAIL_POSTAL_ADDRESS` is still the placeholder above. */
export const REVIEW_EMAIL_POSTAL_ADDRESS_CONFIGURED =
  !REVIEW_EMAIL_POSTAL_ADDRESS.startsWith("[NEEDS DATA");

export type ReviewRequestEmailProps = {
  name: string;
  service: string;
  reviewUrl: string;
  sessionDate: string;
};

/**
 * Sent 3-6 days after a session ends (17-20 days for Full Support, to clear its 14-day WhatsApp
 * window — see docs/lifecycle/2026-09-review-request-sequence.md §1 and the windows in
 * `lib/db/repository.ts`). Deliberately light: one question, one link, no pressure, no incentive,
 * safe to read on a work device. Never names an employer, a situation, or anything from intake —
 * `service` is only ever a product name ("Session + Plan", "Full Support"), never a reason for
 * booking.
 *
 * This is the only NON-transactional email in the codebase, so it carries two things the others
 * do not: a working opt-out (reply-to, mirrored into a `List-Unsubscribe` header by
 * `lib/email/resend.tsx`) and a physical postal address.
 */
export function ReviewRequestEmail({
  name,
  service,
  reviewUrl,
  sessionDate,
}: ReviewRequestEmailProps) {
  const displayName = name || "there";

  return (
    <Html>
      <Head />
      <Preview>Entirely optional — two minutes, if you have them.</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Row>
              <Column align="center">
                <Text style={logo}>humanly</Text>
              </Column>
            </Row>
          </Section>

          <Heading style={heading}>How was your session?</Heading>

          <Text style={greeting}>Hi {displayName},</Text>

          <Text style={paragraph}>
            You had a session with Humanly on {sessionDate} ({service}). We hope it gave you
            something useful to work with.
          </Text>

          <Text style={paragraph}>
            If you have a couple of minutes and feel like sharing how it went, it helps other
            people decide whether to reach out to us. Entirely optional — there's nothing else
            attached to this email.
          </Text>

          <Section style={ctaSection}>
            <Button href={reviewUrl} style={button}>
              Share how it went →
            </Button>
          </Section>

          {/* Deliberately does NOT say "no need to reply": the footer's opt-out below asks the
              recipient to do exactly that, and the two lines contradicted each other eleven
              lines apart. Reply-to-opt-out is the only unsubscribe mechanism that exists today
              (lifecycle doc §3), so nothing here may discourage replying. */}
          <Text style={ctaNote}>
            This is the only time we'll ask about this session.
          </Text>

          <Hr style={hr} />

          <Section style={footerSection}>
            <Text style={footnote}>
              Humanly provides HR guidance and coaching, not legal advice. Your employer is not
              contacted. Your session was 100% confidential, and this email doesn't reference
              anything you told us.
            </Text>
            <Text style={footnoteSecondary}>
              Would rather not hear from us about this again? Reply to this email and let us know
              — we won't ask twice either way.
            </Text>
            <Text style={footnoteSecondary}>
              © {new Date().getFullYear()} Humanly · hello@talkhumanly.com
            </Text>
            {/* Required by CAN-SPAM/CASL for commercial mail — see REVIEW_EMAIL_POSTAL_ADDRESS. */}
            <Text style={footnoteSecondary}>{REVIEW_EMAIL_POSTAL_ADDRESS}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles — mirrors BookingConfirmationEmail / PaymentReceiptEmail so all three client emails
// read as one system. Deliberately no "details card" here: this is a light ask, not a receipt,
// so sessionDate/service sit in a sentence rather than a table.
const main: React.CSSProperties = {
  backgroundColor: "#f8f7f4",
  color: "#1a1c1c",
  fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
};

const container: React.CSSProperties = {
  margin: "0 auto",
  padding: "0",
  maxWidth: "600px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
};

const headerSection: React.CSSProperties = {
  backgroundColor: "#3f1b73",
  background: "linear-gradient(135deg, #3f1b73 0%, #7c35e3 50%, #fda544 100%)",
  padding: "32px 24px",
  textAlign: "center",
};

const logo: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "800",
  letterSpacing: "-0.02em",
  margin: "0",
  textTransform: "lowercase",
};

const heading: React.CSSProperties = {
  color: "#3f1b73",
  fontSize: "28px",
  fontWeight: "800",
  lineHeight: "1.2",
  padding: "24px 24px 0",
  margin: "0",
};

const greeting: React.CSSProperties = {
  fontSize: "17px",
  fontWeight: "600",
  lineHeight: "1.5",
  padding: "8px 24px 0",
  margin: "0",
  color: "#1a1c1c",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#1a1c1c",
  padding: "0 24px",
  margin: "10px 0",
};

const ctaSection: React.CSSProperties = {
  textAlign: "center",
  padding: "20px 24px 4px",
};

const button: React.CSSProperties = {
  backgroundColor: "#7c35e3",
  borderRadius: "999px",
  color: "#ffffff",
  display: "inline-block",
  fontWeight: "700",
  fontSize: "15px",
  padding: "14px 28px",
  textDecoration: "none",
  textAlign: "center",
};

const ctaNote: React.CSSProperties = {
  color: "#5b5b5b",
  fontSize: "13px",
  lineHeight: "1.5",
  padding: "0 24px",
  margin: "6px 0 0",
  textAlign: "center",
};

const hr: React.CSSProperties = {
  borderColor: "#dbdbdb",
  margin: "20px 24px 16px",
};

const footerSection: React.CSSProperties = {
  backgroundColor: "#f8f7f4",
  padding: "20px 24px",
  textAlign: "center",
};

const footnote: React.CSSProperties = {
  color: "#5b5b5b",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "0 0 8px",
};

const footnoteSecondary: React.CSSProperties = {
  color: "#a0a0a0",
  fontSize: "11px",
  lineHeight: "1.5",
  margin: "0 0 4px",
};
