# Offline GarageDocs

GarageDocs has an installable web manifest and an opt-in offline snapshot.
Open **Offline access** in the footer or **Reading preferences → Offline access**.
Choose **Download for offline use** and wait for **ready offline** before disconnecting.
Browser installation and downloading the documentation are separate actions.
Use **Install GarageDocs** when offered, the browser's install menu, or Safari's
**Share → Add to Home Screen**.

## Included

Every generated HTML page and redirect, local image, font, icon, stylesheet,
script, Pagefind index, and Java compiler asset is included. The build reports the
current size (approximately 43 MiB). The official team logo supplies the app icons.

YouTube videos and external websites need internet. CheerpJ still downloads its
Java runtime from Leaning Technologies. An online warm-up does not guarantee
later offline execution; the PWA promises offline reading and search, not a
fully offline Java runtime.

## Build and deploy

Run `npm run build`. The postbuild command runs Pagefind, then
`scripts/build-offline.mjs`. That order is required: generating a worker before
Pagefind would omit the search index.

The generator writes `dist/manifest.webmanifest`, `dist/offline-info.json`, and
`dist/sw.js`. It hashes the final files and worker implementation into a build
version. No runtime dependency or new deployment service is required. The
existing GitHub Pages workflow includes these files automatically.

`BASE_PATH` must have the same value for Astro and postbuild. Both root hosting
and a prefix such as `/garagedocs` are supported. When checking a prefixed build,
also pass that `BASE_PATH` to `npm run links`.

Offline controls are disabled under `astro dev`. Test a production build over
HTTPS or localhost. Use a separate preview port to keep a production service
worker from controlling a development server on the same origin.

## Download and update behavior

Registration starts only after the reader chooses to download. Once registered,
the browser checks for updates on subsequent visits. Updates download a complete
snapshot; the UI prompts before activating a waiting worker and reloading.
Readers should save code before applying an update. Other open tabs keep running;
one previous snapshot is retained for their lazy-loaded assets.

Downloads run in batches of eight. Every response is checked against its
build-time SHA-256 hash. A failed, interrupted, or mixed-deployment download
cannot replace the previous working snapshot. Keep the tab open through the
download. An incomplete download offers a retry.

Cache keys are scoped to the deployment path. The worker intercepts same-origin
requests inside that scope only. It never caches external websites or CheerpJ.
Known pages accept trailing slashes, index.html URLs, and query strings.
An unknown offline route returns the local 404 page with status 404.

The app requests persistent browser storage. The browser can still decline the
request, and clearing site data removes the copy. The readiness check verifies
the snapshot marker and cached entry count rather than relying on localStorage.
The current and previous snapshots together can occupy about twice the reported
download size.

## Validation checklist

- Build at the root and under /garagedocs; run Astro check and the link checker.
- In a fresh browser profile, visiting the site must not start a service worker.
- Download the copy, disconnect, then navigate directly to each curriculum,
  Resources, References, and both Java branches.
- Search for a term and open a result while offline.
- Fetch every manifest asset with the network disabled.
- Check the official images, icons, and fonts in light and dark mode.
- Check the preferences panel and update notice at a phone viewport.
- Make a release asset return 503 during an update: the old copy must survive.
- Serve a successful new worker: it must wait for Update and reload.
- Clear the offline cache and verify that Download again repairs the copy.

Implementation references:
- https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting
- https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
