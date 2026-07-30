import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * serverExternalPackages — keep MongoDB (and bcryptjs) out of the browser/edge bundle.
   *
   * MongoDB uses Node.js built-ins (net, tls, fs) that cannot run in the browser
   * or Next.js Edge runtime. Marking them external tells Next.js to leave them as
   * server-side requires so they are only evaluated in the Node.js runtime.
   */
  serverExternalPackages: ['mongodb', 'bcryptjs'],
};

export default nextConfig;
