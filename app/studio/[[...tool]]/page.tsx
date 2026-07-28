/**
 * Sanity Studio, mounted at `/studio` (https://talkhumanly.com/studio).
 *
 * The catch-all segment hands every path below `/studio` to the Studio's own router:
 * https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
 *
 * `basePath` in `sanity.config.ts` must stay in sync with this directory name, and
 * `https://talkhumanly.com` must be listed as a CORS origin (with credentials) in
 * Sanity Manage → API, otherwise the Studio loads but cannot log in.
 */

import type { Metadata, Viewport } from 'next'
import { NextStudio } from 'next-sanity/studio'
import {
  metadata as studioMetadata,
  viewport as studioViewport,
} from 'next-sanity/studio'
import config from '../../../sanity.config'

export const dynamic = 'force-static'

// The Studio is an authoring tool, not a page. `robots.ts` disallows it for crawlers
// that read robots.txt; this keeps it out of the index for everything else.
export const metadata: Metadata = {
  ...studioMetadata,
  robots: { index: false, follow: false, nocache: true },
}

export const viewport: Viewport = studioViewport

export default function StudioPage() {
  return <NextStudio config={config} />
}
