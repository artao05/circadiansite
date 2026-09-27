import { headers } from "next/headers";

export const siteName = "Circadian Primer";
export const siteTitle = "Circadian Primer: Biology Changes by the Hour";
export const siteDescription =
  "Explore how body time shapes sleep, genes, organs, and the way medicines meet a changing biological system.";

/**
 * Public origin for canonical, Open Graph, robots, and sitemap URLs.
 *
 * Set NEXT_PUBLIC_SITE_URL at build time to pin one domain (for example a
 * custom domain in front of workers.dev). Otherwise the request's Host header
 * is used: Cloudflare routes on Host, so it always names this Worker, unlike
 * client-controlled X-Forwarded-* headers, which are ignored.
 */
export async function getSiteOrigin(): Promise<URL> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return new URL(configured);

  const host = (await headers()).get("host") ?? "localhost:3000";
  const isLocal = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
  try {
    return new URL(`${isLocal ? "http" : "https"}://${host}`);
  } catch {
    return new URL("http://localhost:3000");
  }
}
