import { CogIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

/**
 * Singleton. Feeds the Organization / WebSite JSON-LD in `app/layout.tsx`.
 *
 * Keeping the name, description and profile URLs in one place is what makes the
 * brand resolve as a single entity across the site, structured data, and external
 * directory listings. Inconsistent entity data is the most common reason a brand's
 * mentions fail to be connected to it.
 */
export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "entity", title: "Entity", default: true },
    { name: "defaults", title: "Default SEO" },
  ],
  fields: [
    defineField({
      name: "organizationName",
      title: "Organisation name",
      type: "string",
      group: "entity",
      description: "Must match exactly what's used on every external profile and directory listing.",
    }),
    defineField({
      name: "organizationDescription",
      title: "Organisation description",
      type: "text",
      rows: 3,
      group: "entity",
    }),
    defineField({
      name: "sameAs",
      title: "Official profiles",
      type: "array",
      of: [{ type: "url" }],
      group: "entity",
      description:
        "LinkedIn, Instagram, Crunchbase, directory listings. Emitted as schema.org sameAs.",
    }),
    defineField({
      name: "defaultSeo",
      title: "Site-wide default SEO",
      type: "seo",
      group: "defaults",
      description: "Used when a page has no SEO of its own.",
    }),
  ],
  preview: {
    select: { title: "organizationName" },
    prepare: ({ title }) => ({ title: title || "Site settings" }),
  },
});
