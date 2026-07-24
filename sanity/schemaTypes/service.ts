import { CaseIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import { serviceProducts } from "../../lib/products";

/**
 * Marketing COPY for a service. Deliberately does NOT own price, Stripe price ID,
 * Cal.com link, mode or scheduling flags — those live in `lib/products.ts` and drive
 * real charges. A CMS edit must never be able to change what a client is billed.
 *
 * Docs are matched to the in-code product by `slug`; `getServices()` in
 * `lib/sanity/queries.ts` merges them and falls back to the in-code copy when a
 * doc is missing or unpublished.
 */
export const serviceType = defineType({
  name: "service",
  title: "Service copy",
  type: "document",
  icon: CaseIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "slug",
      title: "Service",
      type: "string",
      group: "content",
      description:
        "Which service this copy belongs to. Pricing and scheduling for each service are configured in code, not here.",
      options: {
        list: serviceProducts.map((product) => ({
          title: `${product.name} — AED ${product.amountAed}`,
          value: product.slug,
        })),
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "name", title: "Display name", type: "string", group: "content" }),
    defineField({ name: "subtitle", type: "string", group: "content" }),
    defineField({ name: "description", type: "text", rows: 3, group: "content" }),
    defineField({
      name: "features",
      title: "What's included",
      type: "array",
      of: [{ type: "string" }],
      group: "content",
    }),
    defineField({
      name: "forWho",
      title: "Who it's for",
      type: "text",
      rows: 2,
      group: "content",
    }),
    defineField({ name: "seo", type: "seo", group: "seo" }),
  ],
  preview: { select: { title: "name", subtitle: "subtitle" } },
});
