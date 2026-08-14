# kū-on

A quiet, fast-acting collection of grounding and regulation exercises for difficult moments.

## Live prototype

[Open kū-on](https://xanadauchaos.github.io/ku-on-app/)

## What it includes

- **Right now** — a quick reset or a route based on what feels loudest.
- **Breathe** — Box, Release, and Even guided breathing rhythms.
- **Ground** — a gentle 5-4-3-2-1 sensory grounding exercise.
- **Settle** — short body-based tension release.
- **Let go** — an unsent, unsaved writing ritual for resentment.
- **Untangle** — a short reflection path for shame or guilt.

## Privacy

The prototype runs in the browser. The Let go writing exercise is not saved by the app.

## Important note

kū-on is a personal project for emotional self-support. It is not a substitute for professional care, diagnosis, or emergency help.

## Project structure

- `index.html` contains the current application.
- `.pages.yml` defines the current Pages CMS editing interface.
- `content/*/content.json` contains editable copy for all seven app sections.
- The older `_index.md` files are retained as recovery references but are no longer loaded by the app.
- `.github/workflows/deploy.yml` publishes `main` to GitHub Pages.

## Editing content

Open the repository in [Pages CMS](https://pagescms.org/), choose an app section, edit its fields, and save. Pages CMS commits the matching JSON file to `main`; the existing GitHub Pages workflow then republishes the site.

The app keeps its current built-in copy as a fallback. If an editable content file is missing or invalid, the page still renders instead of going blank.

## Offline use

After opening the live site online once, add kū-on to the device Home Screen. The app shell, editable copy, current shoreline audio, and breathing narration are then available without a connection. When online, CMS copy is checked for updates before the cached version is used.

When adding or replacing a precached asset, update `PRECACHE_URLS` and increment `CACHE_VERSION` in `service-worker.js` so installed copies receive the new offline package.
