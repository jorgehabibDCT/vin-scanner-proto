# VIN Scanner Prototype (PROD-221)

Mobile-friendly web prototype for scanning and validating 17-character vehicle VINs via the device camera.

## Run locally

```bash
npm install
npm run dev
```

Open the dev server URL on a phone (HTTPS may be required for camera on non-localhost). Use `npm run build` for production output.

## Scripts

- `npm run dev` — development server
- `npm run build` — typecheck + production build
- `npm run lint` — ESLint
- `npm run preview` — preview production build

## Architecture

| Module | Role |
|--------|------|
| `src/lib/vinValidation.ts` | Normalize, character rules, ISO 3779 checksum |
| `src/lib/vinExtraction.ts` | Find VIN candidates in OCR text |
| `src/lib/ocrClient.ts` | OCR abstraction (Tesseract.js; swappable) |
| `src/api/pegasusClient.ts` | Pegasus API placeholders only |
| `src/components/CameraScanner.tsx` | Camera + frame capture |
| `src/components/VinResultCard.tsx` | Results, validation UI, manual entry |

## Deploying to Render

This app deploys as a **Render Static Site** (Blueprint: `type: web` + `runtime: static`).

| Setting | Value |
|---------|--------|
| **Service type** | Static Site |
| **Build command** | `npm ci && npm run build` |
| **Publish directory** | `dist` |
| **Root directory** | *(leave blank — app is at repo root)* |
| **Auto deploy** | Enabled from `main` (connect [vin-scanner-proto](https://github.com/jorgehabibDCT/vin-scanner-proto.git)) |

### Blueprint (recommended)

Commit `render.yaml` at the repo root, then in the Render Dashboard: **New → Blueprint** → connect the GitHub repo. Render will create the static site with build, publish path, and SPA rewrites.

### Manual Dashboard setup

If not using a Blueprint:

1. **New → Static Site** → connect `https://github.com/jorgehabibDCT/vin-scanner-proto.git`
2. Build command: `npm ci && npm run build`
3. Publish directory: `dist`
4. **Redirects/Rewrites** (SPA fallback):
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - **Action:** Rewrite

### HTTPS and mobile camera testing

Render serves the site over **HTTPS/TLS** by default. Mobile browsers require a [secure context](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#privacy_and_security) for `getUserMedia()` — use the **Render HTTPS URL** when testing on a phone.

- **Do** test on `https://<your-service>.onrender.com`
- **Avoid** plain `http://` on a LAN IP for camera tests (often blocked)
- **Local dev:** `http://localhost` is usually allowed; for device testing off-machine, use the Render URL or an HTTPS tunnel (e.g. ngrok with TLS)

### Production safety

- **Pegasus is not wired** — `searchVehicleByVin` and `associateVehicleWithDevice` are client-side placeholders only; no production API calls or writes.
- **Do not put Pegasus API tokens in `VITE_*` env vars** — Vite inlines `VITE_*` values into the browser bundle, so they are visible to anyone.
- **Future Pegasus writes** (vehicle lookup, IMEI association) should go through a **backend or BFF** that holds secrets server-side.
- **This prototype** keeps camera, OCR (Tesseract.js), and VIN validation entirely **client-side**.

### Local production preview

```bash
npm run build
npm run preview
```

Serves the `dist/` output locally (default `http://localhost:4173`).

## Next steps (production)

- Improve OCR: crop VIN region, cloud OCR, or dedicated barcode/VIN models
- Add a backend/BFF for Pegasus search and device association (never expose tokens in the static app)
- Deploy via Render Blueprint or Static Site settings above
