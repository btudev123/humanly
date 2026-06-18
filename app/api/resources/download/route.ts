import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { hasDatabase } from "@/lib/db/client";
import { getResourceForSlug, hasResourceEntitlement } from "@/lib/db/repository";
import { absoluteUrl } from "@/lib/site";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  const slug = url.searchParams.get("slug");

  if (!sessionId || !slug) {
    return Response.json({ error: "Missing session_id or slug." }, { status: 400 });
  }

  if (!hasDatabase()) {
    return Response.json({ error: "Payment infrastructure is not configured." }, { status: 503 });
  }

  const resource = await getResourceForSlug(slug);
  if (!resource) {
    return Response.json({ error: "Unknown resource." }, { status: 404 });
  }

  const entitled = await hasResourceEntitlement(sessionId, slug);
  if (!entitled) {
    return Response.json({ error: "Payment is required to download this resource." }, { status: 402 });
  }

  // Protected content MUST be served from private Vercel Blob and only after the
  // entitlement check above. Stream it through this endpoint so the blob URL is
  // never exposed to the client.
  if (resource.pdf.startsWith("https://")) {
    const blob = await get(resource.pdf, { access: "private" });
    if (blob?.stream) {
      return new Response(blob.stream, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${slug}.pdf"`,
          // Private, authenticated download — never cache at the edge or in shared caches.
          "Cache-Control": "private, no-store, max-age=0",
        },
      });
    }
    return Response.json({ error: "This resource is not available yet. Please contact support." }, { status: 503 });
  }

  // SECURITY: a gated resource must never be redirected to a world-readable
  // /public path (that would bypass payment). Only free resources may do that.
  if (resource.gated) {
    return Response.json(
      { error: "This resource is not available yet. Our team has been notified." },
      { status: 503 }
    );
  }

  return NextResponse.redirect(absoluteUrl(resource.pdf));
}
