import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function hasStripe() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is required for payments.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }

  return stripeClient;
}

export async function getInvoiceForSession(session: Stripe.Checkout.Session) {
  if (!session.invoice || typeof session.invoice !== "string") return null;

  try {
    return await getStripe().invoices.retrieve(session.invoice);
  } catch {
    return null;
  }
}
