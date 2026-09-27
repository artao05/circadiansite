# Circadian Primer

An interactive, visual primer on circadian biology and chronomedicine: how body
time shapes sleep, genes, organs, and the way medicines meet a changing
biological system.

The site is educational. It never tells visitors to change when they take a
medication; that conversation belongs with a clinician or pharmacist.

## Run it locally

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

GitHub Actions runs the same checks on pushes to `main` and on pull requests
(`.github/workflows/ci.yml`).

## Deploy to Cloudflare Workers

`npm run build` compiles the site and writes the Worker config to
`dist/server/wrangler.json`. The Worker is named `circadian-biology-primer`
after the `name` in `package.json`, so renaming the package deploys a new
Worker.

```bash
npm run deploy   # build, then wrangler deploy
```

With Workers Builds (Git integration), use `npm run build` as the build command
and `npx wrangler deploy` as the deploy command.

Canonical, Open Graph, robots, and sitemap URLs use the host a visitor
requested. To pin them to one domain, set `NEXT_PUBLIC_SITE_URL` (for example
`https://example.com`) as a build variable.

## How it fits together

- `app/page.tsx` composes the report. Chapters, citations, the claim matrix,
  and other content live in `app/content/site-data.ts`.
- The master clock (`app/components/CircadianTimeProvider.tsx`) repaints the
  whole page by hour. It opens on the visitor's local hour; `worker/index.ts`
  passes Cloudflare's IP-based time zone along so the first render is already
  in the right phase. Links like `/?t=23` share a specific hour, and moving the
  clock keeps `?t=` up to date.
- Heavy visuals load on demand: the 3D brain and clock-protein scenes when they
  scroll near, and the hero's day/night photo one hour at a time.
- `rhythm-lab-model/` holds the offline Python model behind the rhythm lab's
  committed data.
- `AGENTS.md` covers the design, theming, citation, and scientific-safety rules
  for anyone (human or AI) editing the site.
