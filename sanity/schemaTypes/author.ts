import { UserIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

/**
 * Article author. `linkedinUrl` feeds both the visible byline link and the
 * Person JSON-LD `sameAs` array — the signal that ties the author entity to a
 * real, verifiable profile for search and AI crawlers.
 */
export const authorType = defineType({
  name: "author",
  title: "Author",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "role",
      title: "Role / title",
      type: "string",
      description: 'e.g. "Founder of Humanly"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "bio",
      title: "Short bio",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "linkedinUrl",
      title: "LinkedIn profile URL",
      type: "url",
      description:
        "The clean profile URL, without ?utm_source tracking parameters. Used for the byline link and structured data.",
    }),
    defineField({
      name: "photo",
      type: "image",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "photo" },
  },
});
