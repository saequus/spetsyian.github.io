/** @type {import('next').NextConfig} */
const bookingApiSecret =
  process.env.NEXT_PUBLIC_BOOKING_API_SECRET ||
  process.env.BOOKING_API_SECRET ||
  process.env.VITE_BOOKING_API_SECRET ||
  ''

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BOOKING_API_SECRET: bookingApiSecret,
  },
}

module.exports = nextConfig
