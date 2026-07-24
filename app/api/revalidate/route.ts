import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { parseBody } from "next-sanity/webhook";
import type { SanityTag } from "@/lib/sanity/fetch";

export const runtime = "nodejs";

/** Every content tag used by the query layer — purged together in secret-query mode. */
const ALL_TAGS: SanityTag[] = ["post", "page", "service", "resource", "author", "siteSettings"];

/**
 * Sanity publish webhook → purge cached content so an edit in Studio appears
 * without waiting for the 1-hour ISR window.
 *
 * Two authenticated modes, both keyed off SANITY_REVALIDATE_SECRET:
 *
 *  1. **Secret in query** (`?secret=…`) — used by Sanity's document ("legacy")
 *     webhooks, which cannot send the signed header. Purges every content tag.
 *     The payload is ignored, so it works whatever shape Sanity sends.
 *  2. **Signed body** — used by GROQ-powered webhooks. The signature is verified
 *     and only the changed document's `_type` tag is purged.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json(
      { message: "SANITY_REVALIDATE_SECRET is not configured" },
      { status: 500 },
    );
  }

  // Mode 1: shared secret passed as a query parameter.
  if (req.nextUrl.searchParams.get("secret") === secret) {
    for (const tag of ALL_TAGS) revalidateTag(tag, { expire: 0 });
    return NextResponse.json({ revalidated: true, tags: ALL_TAGS, now: Date.now() });
  }

  // Mode 2: GROQ-powered webhook with a signed body.
  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string; slug?: string }>(
      req,
      secret,
    );

    if (!isValidSignature) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }

    if (!body?._type) {
      return NextResponse.json({ message: "Bad request: missing _type" }, { status: 400 });
    }

    // Next 16 requires a cache profile; `{ expire: 0 }` purges immediately,
    // matching the pre-16 single-argument `revalidateTag(tag)` behaviour.
    revalidateTag(body._type, { expire: 0 });

    return NextResponse.json({ revalidated: true, tag: body._type, now: Date.now() });
  } catch (error) {
    console.error("[revalidate] webhook failed:", error);
    return NextResponse.json({ message: "Webhook handling failed" }, { status: 500 });
  }
}
