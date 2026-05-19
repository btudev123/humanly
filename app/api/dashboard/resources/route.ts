import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/admin";
import { getSql, hasDatabase } from "@/lib/db/client";

export const runtime = "nodejs";

const resourcePatchSchema = z.object({
  slug: z.string().min(1),
  published: z.boolean(),
});

export async function GET() {
  const blocked = await requireAdminApi();
  if (blocked) return blocked;
  if (!hasDatabase()) return Response.json({ error: "DATABASE_URL is missing." }, { status: 503 });

  const sql = getSql();
  const rows = await sql`select * from resources order by updated_at desc`;
  return Response.json({ resources: rows });
}

export async function PATCH(request: Request) {
  const blocked = await requireAdminApi();
  if (blocked) return blocked;
  if (!hasDatabase()) return Response.json({ error: "DATABASE_URL is missing." }, { status: 503 });

  const body = resourcePatchSchema.parse(await request.json());
  const sql = getSql();
  await sql`
    update resources
    set published = ${body.published}, updated_at = now()
    where slug = ${body.slug}
  `;

  return Response.json({ ok: true });
}
