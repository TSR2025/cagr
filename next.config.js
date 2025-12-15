/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    reactCompiler: false
  },
  output: "export",
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig;
