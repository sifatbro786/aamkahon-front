// Admin uploads are served by the Express backend (/uploads/...). Allow its
// origin for next/image, derived from NEXT_PUBLIC_API_URL so each client
// build needs no code change.
const apiOrigin = (() => {
    try {
        return new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5030/api");
    } catch {
        return null;
    }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        agentFeedback: true,
    },
    cacheComponents: true,
    partialPrefetching: true,
    reactCompiler: true,
    images: {
        formats: ["image/avif", "image/webp"],
        remotePatterns: apiOrigin
            ? [
                  {
                      protocol: apiOrigin.protocol.replace(":", ""),
                      hostname: apiOrigin.hostname,
                      port: apiOrigin.port,
                      pathname: "/uploads/**",
                  },
              ]
            : [],
    },
    turbopack: {
        rules: {
            "*.css": {
                loaders: ["@tailwindcss/turbopack"],
                as: "*.css",
            },
        },
    },
};

export default nextConfig;
