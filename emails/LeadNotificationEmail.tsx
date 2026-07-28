import {
  Body,
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

export type LeadNotificationEmailProps = {
  service: string;
  priceFormatted?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  urgency?: string | null;
  concern?: string | null;
  message?: string | null;
  /**
   * Service-specific intake answers — the job posting link for interview prep, the
   * document type for a review, headcount for a corporate booking. Labelled rather
   * than typed, because the questions differ per service (see `lib/intake.ts`).
   */
  details?: { label: string; value: string }[] | null;
  paid: boolean;
  orderId?: string | null;
  /** Present only once the client has picked a time in Cal.com. */
  startTime?: string | null;
  endTime?: string | null;
  meetingUrl?: string | null;
  bookingUid?: string | null;
};

/** True once Cal.com has confirmed a slot — the final stage of the funnel. */
export function isBookedLead(input: {
  startTime?: string | null;
  bookingUid?: string | null;
}) {
  return Boolean(input.startTime || input.bookingUid);
}

export function LeadNotificationEmail({
  service,
  priceFormatted,
  name,
  email,
  phone,
  urgency,
  concern,
  message,
  details,
  paid,
  orderId,
  startTime,
  endTime,
  meetingUrl,
  bookingUid,
}: LeadNotificationEmailProps) {
  const booked = isBookedLead({ startTime, bookingUid });

  const statusLabel = booked
    ? "BOOKED — paid and scheduled"
    : paid
      ? "PAID — payment confirmed (no time picked yet)"
      : "NEW — form submitted (not yet paid)";

  const when = startTime && endTime ? `${startTime} → ${endTime}` : startTime;

  const rows: { label: string; value?: string | null }[] = [
    { label: "Status", value: statusLabel },
    { label: "Service", value: service },
    { label: "Price", value: priceFormatted },
    { label: "When", value: when },
    { label: "Meeting", value: meetingUrl },
    { label: "Booking ID", value: bookingUid },
    { label: "Name", value: name },
    { label: "Email", value: email },
    { label: "Phone", value: phone },
    { label: "Urgency", value: urgency },
    { label: "Situation", value: concern },
    // Service-specific answers sit with the rest of the intake rather than in a
    // separate block, so the email reads as one form regardless of which one it was.
    ...(details ?? []),
    { label: "Order ID", value: orderId },
  ];

  const headerColor = booked ? "#1f7a44" : paid ? "#7c35e3" : "#3f1b73";

  return (
    <Html>
      <Head />
      <Preview>
        {booked ? "Booked" : paid ? "Paid lead" : "New lead"}: {name} — {service}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ ...headerSection, background: headerColor }}>
            <Row>
              <Column align="center">
                <Text style={logo}>humanly · lead</Text>
              </Column>
            </Row>
          </Section>

          <Heading style={heading}>
            {booked ? "Meeting booked" : paid ? "Paid — awaiting scheduling" : "New booking lead"}
          </Heading>
          <Text style={paragraph}>
            {booked
              ? "The client paid and has now picked a time. Full intake details and meeting details below."
              : paid
                ? "A payment just completed. The client has not picked a time yet."
                : "Someone submitted the booking intake form. They have been sent to Stripe to pay."}
          </Text>

          <Section style={card}>
            {rows.map((row) =>
              row.value ? (
                <Row key={row.label} style={detailRow}>
                  <Column style={labelCol}>
                    <Text style={label}>{row.label}</Text>
                  </Column>
                  <Column style={valueCol}>
                    <Text style={value}>{row.value}</Text>
                  </Column>
                </Row>
              ) : null
            )}
          </Section>

          {message ? (
            <Section style={messageSection}>
              <Text style={label}>What is happening?</Text>
              <Text style={messageText}>{message}</Text>
            </Section>
          ) : null}

          <Hr style={hr} />
          <Section style={footerSection}>
            <Text style={footnoteSecondary}>
              Internal lead notification · © {new Date().getFullYear()} Humanly
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

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
  padding: "24px",
  textAlign: "center",
};

const logo: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: "800",
  letterSpacing: "-0.02em",
  margin: "0",
  textTransform: "lowercase",
};

const heading: React.CSSProperties = {
  color: "#3f1b73",
  fontSize: "24px",
  fontWeight: "800",
  lineHeight: "1.2",
  padding: "20px 24px 0",
  margin: "0",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#1a1c1c",
  padding: "0 24px",
  margin: "8px 0",
};

const card: React.CSSProperties = {
  backgroundColor: "#f8f7f4",
  border: "1px solid #dbdbdb",
  borderRadius: "8px",
  margin: "16px 24px",
  padding: "16px 20px",
};

const detailRow: React.CSSProperties = {
  marginBottom: "8px",
};

const labelCol: React.CSSProperties = {
  width: "110px",
  verticalAlign: "top",
};

const valueCol: React.CSSProperties = {
  verticalAlign: "top",
};

const label: React.CSSProperties = {
  color: "#5b5b5b",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  margin: "0",
};

const value: React.CSSProperties = {
  color: "#3f1b73",
  fontSize: "15px",
  fontWeight: "600",
  margin: "0",
  wordBreak: "break-word",
};

const messageSection: React.CSSProperties = {
  padding: "0 24px",
  margin: "4px 0 12px",
};

const messageText: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#1a1c1c",
  backgroundColor: "#f8f7f4",
  border: "1px solid #dbdbdb",
  borderRadius: "8px",
  padding: "12px 14px",
  margin: "6px 0 0",
  whiteSpace: "pre-wrap",
};

const hr: React.CSSProperties = {
  borderColor: "#dbdbdb",
  margin: "8px 24px",
};

const footerSection: React.CSSProperties = {
  backgroundColor: "#f8f7f4",
  padding: "16px 24px",
  textAlign: "center",
};

const footnoteSecondary: React.CSSProperties = {
  color: "#a0a0a0",
  fontSize: "11px",
  lineHeight: "1.5",
  margin: "0",
};
