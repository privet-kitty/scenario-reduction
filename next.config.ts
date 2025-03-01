import type { NextConfig } from "next";

const isProd = process.env.SR_ENV === "production";
const isStatic = isProd || process.env.SR_STATIC === "true";

const PROD_SUBDIRECTORY = "/scenario-reduction";

const nextConfig: NextConfig = {
  output: isStatic ? "export" : "standalone",
  basePath: isProd ? PROD_SUBDIRECTORY : "",
  assetPrefix: isProd ? PROD_SUBDIRECTORY : "",
};

export default nextConfig;
