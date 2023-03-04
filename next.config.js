module.exports = {
  images: {
    formats: ['image/avif', 'image/webp']
  },
  rewrites: async () => [
    {
      source: "/apps/game-of-life",
      destination: "/assets/apps/game-of-life.html",
    }
  ],
}
