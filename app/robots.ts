import type { MetadataRoute } from "next";
import { getSiteOrigin } from "./lib/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = await getSiteOrigin();

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", origin).toString(),
  };
}
