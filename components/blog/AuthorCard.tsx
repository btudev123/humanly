import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Linkedin } from "lucide-react";
import type { ArticleAuthor } from "@/lib/sanity/queries";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * The "who wrote this" card.
 *
 * Does three jobs at once: it carries the E-E-A-T signal (a named, credentialed human
 * with a verifiable public profile), it links the article back into `/about` and
 * `/booking` so no post is a dead end, and it gives the byline somewhere to go — the
 * author's name is a real link to their LinkedIn profile, not decoration.
 *
 * The LinkedIn URL is always the clean canonical profile. Share-sheet tracking params
 * (`utm_source=share_via`, `utm_content=profile`, …) are deliberately never used: they
 * break entity resolution for the same `sameAs` URL emitted in the page's JSON-LD.
 */

export function resolveAuthorLinkedIn(author?: ArticleAuthor | null) {
  return (
    author?.linkedinUrl ||
    (author?.name === siteConfig.founder ? siteConfig.founderLinkedIn : undefined)
  );
}

const FOUNDER_BIO =
  "Karma spent close to 20 years inside HR — regulated industries, government, national media and investment management across Canada, the UAE, Saudi Arabia and Pakistan — running the investigations, PIPs and restructures that decide careers. She founded Humanly to put that expertise on the employee's side of the table.";

export function AuthorCard({
  author,
  className,
}: {
  author?: ArticleAuthor | null;
  className?: string;
}) {
  if (!author?.name) return null;

  const linkedIn = resolveAuthorLinkedIn(author);
  const isFounder = author.name === siteConfig.founder;

  return (
    <aside
      className={cn(
        "rounded-[2rem] border-2 border-primary-dark bg-neutral-100 p-6 shadow-pop-sm sm:p-8",
        className,
      )}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        {isFounder && (
          <Link
            href="/about"
            aria-label={`About ${author.name}`}
            className="shrink-0 self-center sm:self-start"
          >
            <Image
              src="/karma-harb.png"
              alt={`${author.name} — ${author.role}`}
              width={112}
              height={112}
              sizes="112px"
              className="h-28 w-28 rounded-full border-2 border-primary-dark object-cover"
            />
          </Link>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-caption font-bold uppercase tracking-[0.16em] text-primary-violet">
            Written by
          </p>

          <h2 className="text-h4 mt-2 font-display font-extrabold leading-snug text-primary-dark">
            {linkedIn ? (
              <a
                href={linkedIn}
                target="_blank"
                rel="me noopener"
                title={`${author.name} on LinkedIn`}
                className="inline-flex items-center gap-2 underline decoration-primary-violet/50 underline-offset-4 transition-colors hover:text-primary-violet"
              >
                {author.name}
                <Linkedin size={17} strokeWidth={2.5} className="shrink-0 text-primary-violet" />
              </a>
            ) : (
              author.name
            )}
          </h2>
          <p className="mt-1 text-body-sm font-semibold text-neutral-500">{author.role}</p>

          {isFounder && (
            <p className="mt-4 text-body-sm leading-relaxed text-neutral-500">{FOUNDER_BIO}</p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/about"
              className="btn-pop inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-5 py-2.5 text-body-sm font-bold text-primary-dark shadow-pop-sm"
            >
              {isFounder ? "Karma's full story" : "About Humanly"}
              <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
            <Link
              href="/booking"
              className="btn-pop inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-5 py-2.5 text-body-sm font-bold text-primary-dark shadow-pop-sm"
            >
              Book a confidential call
              <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
