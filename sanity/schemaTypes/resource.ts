import { DocumentsIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import { resources } from "../../lib/resources";

/**
 * Marketing COPY + SEO for a paid/free resource.
 *
 * Deliberately does NOT own price, gating, or the PDF itself. Those stay in
 * `lib/resources.ts` and the Clerk-gated `/dashboard` (Neon + Vercel Blob), which
 * remain the single source of truth for file delivery and entitlement. This
 * document only changes what the marketing page says.
 */
export const resourceType = defineType({
  name: "resource",
  title: "Resource copy",
  type: "document",
  icon: DocumentsIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "slug",
      title: "Resource",
      type: "string",
      group: "content",
      description:
        "Which resource this copy belongs to. Pricing, gating and the PDF itself are managed in code and the dashboard, not here.",
      options: {
        list: resources.map((resource) => ({
          title: resource.title,
          value: resource.slug,
        })),
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "title", title: "Display title", type: "string", group: "content" }),
    defineField({ name: "summary", type: "text", rows: 3, group: "content" }),
    defineField({ name: "audience", title: "Who it's for", type: "string", group: "content" }),
    defineField({
      name: "keywords",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      group: "content",
    }),
    defineField({ name: "seo", type: "seo", group: "seo" }),
  ],
  preview: { select: { title: "title", subtitle: "audience" } },
});
