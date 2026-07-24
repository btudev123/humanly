import { defineField, defineType } from "sanity";

/**
 * Reusable SEO object embedded on every document type.
 *
 * Every field is optional by design: `lib/seo.ts` falls back to the document's own
 * title/description (and ultimately to the hardcoded copy that shipped before Sanity),
 * so an empty SEO block can never blank out a page's metadata.
 */
export const seoType = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "metaTitle",
      title: "Meta title",
      type: "string",
      description:
        "Shown as the clickable headline in Google. Aim for 50–60 characters. Leave empty to use the page title.",
      validation: (Rule) =>
        Rule.max(60).warning("Over 60 characters — Google will truncate this in results."),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
      type: "text",
      rows: 3,
      description:
        "The snippet under the headline. Aim for 140–160 characters and front-load the answer.",
      validation: (Rule) =>
        Rule.max(160).warning("Over 160 characters — Google will truncate this in results."),
    }),
    defineField({
      name: "ogImage",
      title: "Social share image",
      type: "image",
      description: "1200×630px works best. Used for LinkedIn, X, WhatsApp and Slack previews.",
      options: { hotspot: true },
    }),
    defineField({
      name: "canonicalOverride",
      title: "Canonical URL override",
      type: "url",
      description:
        "Only set this if this page duplicates content that lives elsewhere. Normally leave empty — the canonical is generated automatically.",
    }),
    defineField({
      name: "noindex",
      title: "Hide from search engines",
      type: "boolean",
      initialValue: false,
      description: "Adds noindex. Use for thin, duplicate or private pages.",
    }),
  ],
});
