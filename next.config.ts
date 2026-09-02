import path from "node:path";

import type { NextConfig } from "next";

process.env.NEXT_FONT_GOOGLE_MOCKED_RESPONSES ??= path.join(
  process.cwd(),
  "lib/next-font-google-mocked-responses.cjs",
);

const nextConfig: NextConfig = {};

export default nextConfig;
