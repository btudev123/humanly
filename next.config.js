/** @type {import('next').NextConfig} */
const nextConfig = {
  // SSG for most pages, SSR where needed (e.g., /booking)
  output: "standalone",

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,

    // Allow Karma's headshot domain, next/image unoptimized for og images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "talkhumanly.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "**.ufs.sh",
      },
      {
        // Images uploaded through Sanity Studio.
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/contact-us",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/pricing",
        destination: "/services",
        permanent: true,
      },
      {
        source: "/book",
        destination: "/booking",
        permanent: true,
      },
      {
        source: "/resources/blog/:slug*",
        destination: "/blog/:slug*",
        permanent: true,
      },
      // The Studio used to live at /sanity. Kept permanently so bookmarked
      // Studio deep links (e.g. /sanity/structure/post) keep resolving.
      {
        source: "/sanity",
        destination: "/studio",
        permanent: true,
      },
      {
        source: "/sanity/:path*",
        destination: "/studio/:path*",
        permanent: true,
      },
    ];
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
      {
        source: "/booking(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
        ],
      },
      {
        // The Studio is an authoring app, never a search result. X-Frame-Options
        // DENY above already blocks framing; this keeps it out of every index.
        source: "/studio(.*)",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive",
          },
        ],
      },
    ];
  },

  // Compress static assets
  compress: true,

  // Generate partial static pages at build time
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;
