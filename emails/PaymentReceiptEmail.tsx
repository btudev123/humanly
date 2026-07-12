import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export type PaymentReceiptEmailProps = {
  name: string;
  service: string;
  priceFormatted?: string | null;
  /** Deep link back into the paid-only Cal.com scheduler. */
  scheduleUrl?: string | null;
  invoiceUrl?: string | null;
  invoicePdfUrl?: string | null;
  orderId?: string | null;
};

export function PaymentReceiptEmail({
  name,
  service,
  priceFormatted,
  scheduleUrl,
  invoiceUrl,
  invoicePdfUrl,
  orderId,
}: PaymentReceiptEmailProps) {
  const displayName = name || "there";

  return (
    <Html>
      <Head />
      <Preview>Payment confirmed — now choose your time</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Row>
              <Column align="center">
                <Text style={logo}>humanly</Text>
              </Column>
            </Row>
          </Section>

          <Heading style={heading}>Payment confirmed</Heading>

          <Text style={greeting}>Hi {displayName},</Text>

          <Text style={paragraph}>
            Thank you — your payment has gone through. The last step is to pick a time
            that suits you.
          </Text>

          <Section style={card}>
            <Text style={cardTitle}>Payment Details</Text>

            <Row style={detailRow}>
              <Column style={labelCol}>
                <Text style={label}>Service</Text>
              </Column>
              <Column style={valueCol}>
                <Text style={value}>{service}</Text>
              </Column>
            </Row>

            {priceFormatted && (
              <Row style={detailRow}>
                <Column style={labelCol}>
                  <Text style={label}>Paid</Text>
                </Column>
                <Column style={valueCol}>
                  <Text style={value}>{priceFormatted}</Text>
                </Column>
              </Row>
            )}

            {orderId && (
              <Row style={detailRow}>
                <Column style={labelCol}>
                  <Text style={label}>Order ID</Text>
                </Column>
                <Column style={valueCol}>
                  <Text style={value}>{orderId}</Text>
                </Column>
              </Row>
            )}
          </Section>

          {scheduleUrl && (
            <>
              <Section style={ctaSection}>
                <Button href={scheduleUrl} style={button}>
                  Choose your time →
                </Button>
              </Section>
              <Text style={ctaNote}>
                Your session is not scheduled until you pick a time. This link stays
                valid — you can come back to it whenever you are ready.
              </Text>
            </>
          )}

          {(invoiceUrl || invoicePdfUrl) && (
            <Section style={invoiceSection}>
              <Text style={invoiceTitle}>Your Invoice</Text>
              <Text style={paragraph}>
                Your invoice is ready.{" "}
                {invoiceUrl && (
                  <Link href={invoiceUrl} style={link}>
                    View invoice online
                  </Link>
                )}
                {invoiceUrl && invoicePdfUrl && " or "}
                {invoicePdfUrl && (
                  <Link href={invoicePdfUrl} style={link}>
                    download PDF
                  </Link>
                )}
                .
              </Text>
            </Section>
          )}

          <Hr style={hr} />

          <Section style={footerSection}>
            <Text style={footnote}>
              Humanly provides HR guidance and coaching, not legal advice.
              Your employer is not contacted. Your session is 100% confidential.
            </Text>
            <Text style={footnoteSecondary}>
              © {new Date().getFullYear()} Humanly · hello@talkhumanly.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles — mirrors BookingConfirmationEmail so both client emails read as one system.
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

const card: React.CSSProperties = {
  backgroundColor: "#f8f7f4",
  border: "1px solid #dbdbdb",
  borderRadius: "8px",
  margin: "20px 24px",
  padding: "20px",
};

const cardTitle: React.CSSProperties = {
  color: "#7c35e3",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  margin: "0 0 16px",
};

const detailRow: React.CSSProperties = {
  marginBottom: "10px",
};

const labelCol: React.CSSProperties = {
  width: "100px",
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

const ctaSection: React.CSSProperties = {
  textAlign: "center",
  padding: "12px 24px 4px",
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

const invoiceSection: React.CSSProperties = {
  padding: "12px 24px",
};

const invoiceTitle: React.CSSProperties = {
  color: "#7c35e3",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  margin: "0 0 6px",
};

const link: React.CSSProperties = {
  color: "#7c35e3",
  textDecoration: "underline",
  fontWeight: "600",
};

const hr: React.CSSProperties = {
  borderColor: "#dbdbdb",
  margin: "16px 24px",
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
  margin: "0",
};
