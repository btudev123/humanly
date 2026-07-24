import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Content is statically generated and revalidated by tag from the Sanity webhook
  // (`app/api/revalidate`), so the CDN's own caching would only add staleness.
  useCdn: false,
  perspective: 'published',
})
