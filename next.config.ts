import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async rewrites() {
    const backend = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backend}/api/v1/:path*`,
      },
      // getMediaUrl() (src/lib/api.ts) returns a relative URL in the browser for
      // every stored file — not just API calls — to avoid Mixed Content over HTTPS.
      // Without this rewrite, uploaded images/documents 404 against the Next.js
      // server instead of reaching the backend that actually serves them.
      {
        source: '/uploads/:path*',
        destination: `${backend}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
