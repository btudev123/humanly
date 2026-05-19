import { put } from "@vercel/blob";
import { requireAdminApi } from "@/lib/auth/admin";
import { getSql, hasDatabase } from "@/lib/db/client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const blocked = await requireAdminApi();
  if (blocked) return blocked;
  if (!hasDatabase()) return Response.json({ error: "DATABASE_URL is missing." }, { status: 503 });

  const formData = await request.formData();
  const file = formData.get("file");
  const slug = String(formData.get("slug") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const summary = String(formData.get("summary") || "").trim();
  const amount = Number(formData.get("amount") || 0) * 100;
  const published = formData.get("published") === "on";

  if (!(file instanceof File) || !slug || !title || !category || !summary || amount <= 0) {
    return Response.json({ error: "Missing upload fields." }, { status: 400 });
  }

  const blob = await put(`resources/${slug}.pdf`, file, {
    access: "private",
    addRandomSuffix: false,
  });

  const sql = getSql();
  await sql`
    insert into resources (slug, title, category, summary, blob_url, amount, gated, published)
    values (${slug}, ${title}, ${category}, ${summary}, ${blob.url}, ${amount}, true, ${published})
    on conflict (slug)
    do update set
      title = excluded.title,
      category = excluded.category,
      summary = excluded.summary,
      blob_url = excluded.blob_url,
      amount = excluded.amount,
      published = excluded.published,
      updated_at = now()
  `;

  return Response.json({ ok: true, url: blob.url });
}
