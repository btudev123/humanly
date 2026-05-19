import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/admin";
import { getSql, hasDatabase } from "@/lib/db/client";

export const runtime = "nodejs";

const testimonialSchema = z.object({
  type: z.enum(["text", "video", "instagram"]),
  quote: z.string().optional(),
  personLabel: z.string().optional(),
  roleLabel: z.string().optional(),
  mediaUrl: z.string().optional(),
  transcript: z.string().optional(),
  published: z.boolean().default(false),
});

export async function POST(request: Request) {
  const blocked = await requireAdminApi();
  if (blocked) return blocked;
  if (!hasDatabase()) return Response.json({ error: "DATABASE_URL is missing." }, { status: 503 });

  const body = testimonialSchema.parse(await request.json());
  const sql = getSql();
  await sql`
    insert into testimonials (
      type,
      quote,
      person_label,
      role_label,
      media_url,
      transcript,
      published,
      verified
    )
    values (
      ${body.type},
      ${body.quote || null},
      ${body.personLabel || null},
      ${body.roleLabel || null},
      ${body.mediaUrl || null},
      ${body.transcript || null},
      ${body.published},
      false
    )
  `;

  return Response.json({ ok: true });
}
