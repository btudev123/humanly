import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

/**
 * The single article typography system, shared by /blog/[slug] and /resources/[slug].
 *
 * Sizes come from the `@theme` token scale (`text-h2`, `text-h3`, `text-body-lg`)
 * rather than per-page values, so an article heading is exactly the same size as the
 * equivalent heading on a marketing page.
 */
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-body-lg leading-relaxed text-neutral-600">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="text-h2 pt-6 font-display font-extrabold tracking-tight text-primary-dark">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-h3 pt-2 font-display font-bold tracking-tight text-primary-dark">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary-violet pl-5 text-body-lg font-medium italic leading-relaxed text-primary-dark">
        {children}
      </blockquote>
    ),
  },

  list: {
    bullet: ({ children }) => <ul className="space-y-3 pl-1">{children}</ul>,
    number: ({ children }) => (
      <ol className="list-decimal space-y-3 pl-6 marker:font-bold marker:text-primary-violet">
        {children}
      </ol>
    ),
  },

  listItem: {
    bullet: ({ children }) => (
      <li className="flex gap-3 text-body-lg leading-relaxed text-neutral-600">
        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-violet" />
        <span>{children}</span>
      </li>
    ),
    number: ({ children }) => (
      <li className="text-body-lg leading-relaxed text-neutral-600">{children}</li>
    ),
  },

  marks: {
    strong: ({ children }) => (
      <strong className="font-bold text-primary-dark">{children}</strong>
    ),
    link: ({ children, value }) => {
      const href: string = value?.href ?? "#";
      const isInternal = href.startsWith("/");

      // Internal links go through next/link so they're prefetched and crawlable
      // as first-party navigation; external links get rel="noopener".
      return isInternal ? (
        <Link
          href={href}
          className="font-semibold text-primary-violet underline underline-offset-4 hover:text-primary-dark"
        >
          {children}
        </Link>
      ) : (
        <a
          href={href}
          target="_blank"
          rel="noopener"
          className="font-semibold text-primary-violet underline underline-offset-4 hover:text-primary-dark"
        >
          {children}
        </a>
      );
    },
  },

  types: {
    callout: ({ value }) => (
      <div className="rounded-3xl border-2 border-primary-dark bg-violet-tint p-6 sm:p-8">
        <p className="text-body-lg font-semibold leading-relaxed text-primary-dark">
          {value?.text}
        </p>
        {value?.ctaLabel && (
          <Link
            href={value?.ctaHref || "/booking"}
            className="btn-pop mt-6 inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-7 py-3.5 text-body-sm font-bold text-primary-dark shadow-pop-sm"
          >
            {value.ctaLabel}
            <ArrowRight size={18} strokeWidth={2.5} />
          </Link>
        )}
      </div>
    ),
    image: ({ value }) =>
      value?.asset?.url ? (
        <Image
          src={value.asset.url}
          alt={value.alt || ""}
          width={1600}
          height={900}
          className="rounded-3xl border-2 border-primary-dark"
          sizes="(max-width: 768px) 100vw, 768px"
        />
      ) : null,
  },
};

export function Prose({ value }: { value: PortableTextBlock[] }) {
  return (
    // [overflow-wrap:anywhere]: CMS copy is free text — an unbroken long word or URL must
    // not be able to push the article column wider than the viewport.
    <div className="space-y-6 [overflow-wrap:anywhere]">
      <PortableText value={value} components={components} />
    </div>
  );
}
