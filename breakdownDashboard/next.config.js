/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      memoryLimit: 4096
    }
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/
      }
    }
    return config
  }
}

module.exports = nextConfig