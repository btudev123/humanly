export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-07-22'

/**
 * True when a Sanity project is configured. When it isn't, the site builds and
 * runs on its in-code content: `sanityFetch` returns null before touching the
 * client, and the placeholders below only exist so `createClient` doesn't throw
 * at module load (it rejects an empty `projectId`, which failed the whole build).
 * `/studio` won't work until the real values are set.
 */
export const isSanityConfigured = Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'unconfigured'
