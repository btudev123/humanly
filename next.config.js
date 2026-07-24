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
