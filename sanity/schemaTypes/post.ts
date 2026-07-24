import { DocumentTextIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const postType = defineType({
  name: "post",
  title: "Blog post",
  type: "document",
  icon: DocumentTextIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "meta", title: "Meta" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 96 },
      description: "The URL for this post: /blog/<slug>. Changing it breaks existing links.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      group: "content",
      description: "Shown on the blog index and used as the fallback meta description.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "lead",
      title: "Lead paragraph",
      type: "text",
      rows: 5,
      group: "content",
      description:
        "The opening paragraph, set larger than the body. Resolve the reader's question in the first 40 words — this is what gets quoted in AI answers and featured snippets.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "block",
          // Only H2 and H3 are offered. H1 is the post title, and allowing authors
          // to pick arbitrary heading levels is how heading hierarchy drifts.
          styles: [
            { title: "Paragraph", value: "normal" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bulleted", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "URL",
                    validation: (Rule: any) =>
                      Rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }),
                  },
                ],
              },
            ],
          },
        }),
        defineArrayMember({
          name: "callout",
          title: "Callout / CTA",
          type: "object",
          fields: [
            { name: "text", type: "text", rows: 3, title: "Text" },
            { name: "ctaLabel", type: "string", title: "Button label" },
            {
              name: "ctaHref",
              type: "string",
              title: "Button link",
              initialValue: "/booking",
            },
          ],
          preview: { select: { title: "text" } },
        }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Alt text",
              description: "Describe the image for screen readers and search engines.",
            },
          ],
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "source",
      title: "Cited source",
      type: "string",
      group: "content",
      description:
        "Shown in small print at the foot of the article. Citing an authoritative source measurably improves how often a page is quoted.",
    }),

    defineField({
      name: "author",
      type: "reference",
      to: [{ type: "author" }],
      group: "meta",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      type: "string",
      group: "meta",
      description: 'e.g. "Careers & Managers"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published date",
      type: "datetime",
      group: "meta",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "readingMinutes",
      title: "Reading time (minutes)",
      type: "number",
      group: "meta",
      validation: (Rule) => Rule.min(1).integer(),
    }),
    defineField({
      name: "keywords",
      type: "array",
      of: [{ type: "string" }],
      group: "meta",
      options: { layout: "tags" },
    }),
    defineField({
      name: "relatedResources",
      title: "Related links",
      type: "array",
      group: "meta",
      of: [{ type: "reference", to: [{ type: "resource" }, { type: "post" }] }],
      description:
        "Surfaced at the foot of the post. Leave empty to fall back to the default resource links.",
    }),
    defineField({ name: "seo", type: "seo", group: "seo" }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "seo.ogImage" },
  },
});
