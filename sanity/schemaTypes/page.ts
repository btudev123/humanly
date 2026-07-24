import { DocumentIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

/**
 * Per-route SEO overrides for the fixed marketing pages. The route list is closed
 * on purpose — these documents don't create pages, they only re-title existing ones,
 * so a free-text path would just produce documents that silently do nothing.
 */
export const ROUTES = [
  { title: "Home", value: "/" },
  { title: "Services", value: "/services" },
  { title: "About", value: "/about" },
  { title: "Resources (index)", value: "/resources" },
  { title: "Blog (index)", value: "/blog" },
  { title: "Free Tools", value: "/tools" },
  { title: "Booking", value: "/booking" },
  { title: "Contact", value: "/contact" },
  { title: "FAQ", value: "/faq" },
  { title: "Privacy Policy", value: "/privacy" },
  { title: "Terms of Service", value: "/terms" },
] as const;

export const pageType = defineType({
  name: "page",
  title: "Page SEO",
  type: "document",
  icon: DocumentIcon,
  fields: [
    defineField({
      name: "route",
      title: "Page",
      type: "string",
      options: { list: ROUTES.map((route) => ({ ...route })) },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heading",
      title: "Page heading (H1)",
      type: "string",
      description: "Leave empty to keep the heading currently coded into the page.",
    }),
    defineField({
      name: "intro",
      title: "Intro paragraph",
      type: "text",
      rows: 3,
      description: "Leave empty to keep the intro currently coded into the page.",
    }),
    defineField({ name: "seo", type: "seo" }),
  ],
  preview: {
    select: { route: "route", title: "seo.metaTitle" },
    prepare: ({ route, title }) => ({
      title: ROUTES.find((r) => r.value === route)?.title ?? route ?? "Untitled",
      subtitle: title || "No meta title set",
    }),
  },
});
