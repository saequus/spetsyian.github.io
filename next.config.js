/** @type {import('next').NextConfig} */
// Deployed on Vercel as a regular Next.js app (not `output: 'export'`) so that
// pages/api/booking/* can run server-side and keep BOOKING_API_SECRET private.
// All content pages still use static generation (prerendered HTML).
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
