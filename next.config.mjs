/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/emergency',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
