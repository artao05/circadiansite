/** Cloudflare Worker entry point. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { VISITOR_TIME_ZONE_HEADER } from "../app/lib/circadian-hour";

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

// Hand Cloudflare's IP-based time zone to the app so the first render already
// shows the visitor's local hour; the browser clock refines it after load.
function withVisitorTimeZone(request: Request): Request {
  const timeZone = (request as Request & { cf?: { timezone?: unknown } }).cf
    ?.timezone;
  const headers = new Headers(request.headers);
  headers.delete(VISITOR_TIME_ZONE_HEADER);
  if (typeof timeZone === "string") {
    headers.set(VISITOR_TIME_ZONE_HEADER, timeZone);
  }
  return new Request(request, { headers });
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    if (request.method === "GET") {
      return handler.fetch(withVisitorTimeZone(request), env, ctx);
    }
    return handler.fetch(request, env, ctx);
  },
};

export default worker;
