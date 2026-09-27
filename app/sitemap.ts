import type { MetadataRoute } from "next";
import { getSiteOrigin } from "./lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = await getSiteOrigin();

  return [
    {
      url: new URL("/", origin).toString(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
