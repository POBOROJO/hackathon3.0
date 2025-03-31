/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'utfs.io',
      'img.clerk.com',
      'subdomain',
    ],
  },
  reactStrictMode: false,
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Adjust based on your needs
    },
  },
};

export default nextConfig;
