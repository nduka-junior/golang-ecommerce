/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // Cloudinary
        port: "",
        pathname: "/**", // Allow all paths under Cloudinary
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com", // Also allow subdomains
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
