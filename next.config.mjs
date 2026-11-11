/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "pdf-parse",
      "pdfjs-dist",
      "pdfexcavator",
      "canvas",
      "sharp",
    ],
    // Limit parallel build workers so static generation fits in memory on
    // small machines (prevents "Fatal process out of memory" during build).
    cpus: 2,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.producthunt.com",
      },
    ],
  },
  async redirects() {
    const winner = "/fr/convertir-pdf-releve-bancaire-en-excel";
    return [
      {
        source: "/fr/convertisseur-releve-bancaire",
        destination: winner,
        permanent: true,
      },
      {
        source: "/fr/releve-bancaire-pdf-excel",
        destination: winner,
        permanent: true,
      },
      {
        source: "/fr/convertir-releve-bancaire-en-excel",
        destination: winner,
        permanent: true,
      },
      {
        source: "/fr/convertisseur-releve-bancaire-excel",
        destination: winner,
        permanent: true,
      },
      {
        source: "/fr/releve-bancaire-vers-excel",
        destination: winner,
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/app",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
      {
        source: "/auth/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
