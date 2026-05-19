import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export function BookingConfirmationEmail({
  name,
  service,
  startTime,
  endTime,
  meetingUrl,
  invoiceUrl,
  invoicePdfUrl,
}: {
  to: string;
  name: string;
  service: string;
  startTime?: string | null;
  endTime?: string | null;
  meetingUrl?: string | null;
  invoiceUrl?: string | null;
  invoicePdfUrl?: string | null;
}) {
  return (
    <Html>
      <Head />
      <Preview>Your confidential Humanly session is confirmed.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Your session is confirmed</Heading>
          <Text style={paragraph}>Hi {name || "there"},</Text>
          <Text style={paragraph}>
            Thank you for booking {service}. Your session is confidential, unrecorded, and prepared
            around the details you shared.
          </Text>
          <Section style={panel}>
            <Text style={label}>Service</Text>
            <Text style={value}>{service}</Text>
            {startTime && (
              <>
                <Text style={label}>Start</Text>
                <Text style={value}>{startTime}</Text>
              </>
            )}
            {endTime && (
              <>
                <Text style={label}>End</Text>
                <Text style={value}>{endTime}</Text>
              </>
            )}
          </Section>
          {meetingUrl && (
            <Button href={meetingUrl} style={button}>
              Join your session
            </Button>
          )}
          {(invoiceUrl || invoicePdfUrl) && (
            <Text style={paragraph}>
              Your Stripe invoice is ready:{" "}
              {invoiceUrl && <a href={invoiceUrl}>view invoice</a>}
              {invoiceUrl && invoicePdfUrl ? " or " : ""}
              {invoicePdfUrl && <a href={invoicePdfUrl}>download PDF</a>}.
            </Text>
          )}
          <Text style={paragraph}>
            Before the call, gather any emails, timelines, contracts, performance notes, or
            messages that may help Karma understand what happened.
          </Text>
          <Text style={footnote}>
            Humanly provides HR guidance and coaching, not legal advice. Your employer is not
            contacted.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f8f7f4",
  color: "#1a1c1c",
  fontFamily: "Arial, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "32px 20px",
  maxWidth: "560px",
};

const heading = {
  color: "#3f1b73",
  fontSize: "32px",
  lineHeight: "1.2",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.6",
};

const panel = {
  backgroundColor: "#ffffff",
  border: "1px solid #dbdbdb",
  borderRadius: "8px",
  padding: "18px",
  margin: "24px 0",
};

const label = {
  color: "#7c35e3",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.12em",
  margin: "14px 0 4px",
  textTransform: "uppercase" as const,
};

const value = {
  color: "#3f1b73",
  fontSize: "17px",
  fontWeight: "700",
  margin: "0 0 8px",
};

const button = {
  backgroundColor: "#7c35e3",
  borderRadius: "999px",
  color: "#ffffff",
  display: "inline-block",
  fontWeight: "700",
  margin: "8px 0 24px",
  padding: "14px 22px",
  textDecoration: "none",
};

const footnote = {
  color: "#5b5b5b",
  fontSize: "13px",
  lineHeight: "1.5",
};
