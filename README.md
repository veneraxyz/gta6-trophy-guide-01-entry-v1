# Leonida Legend — GTA VI Trophy Guide & Tracker

[![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/veneraxyz/gta6-trophy-guide-01-entry-v1/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/veneraxyz/gta6-trophy-guide-01-entry-v1/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI — 1 platinum, 2 gold, 6 silver and 46 bronze, 28 of them hidden until earned.

## What it is

- **Every trophy** with its official name, description and grade as PlayStation publishes them, plus a guide in this entry's own words — with a named, linked source beside each guide.
- **A roadmap to the Platinum** in seven stages: story chapters first (with a manual save at every chapter — there is no mission replay), side strands next, then the long grinds.
- **Missable flags**: Positive Mental Attitude (Lucia's Chapter 1 balcony meditation, the one trophy that can be missed) and the time-sensitive Race Against Yago feeding Strangers & Freaks.
- **A tracker**: tick trophies off, progress saves in the browser (localStorage), export to a file and import it back. Filters by kind — story, missable, collectibles, activities, online (this list has none) — plus search.
- **A spoiler setting** that hides the names and descriptions of story trophies until you earn them.
- **Fully offline**: static files under `app/`, no build step, no network request at runtime. Source links open only when you follow them.

## Honesty about the guides

GTA VI launched on 19 November 2026. Five hidden trophies have no confirmed unlock method at launch, according to the cited launch-week guides — this guide says so for each of them instead of inventing a method. Everything else is grounded in the official descriptions and the cited sources.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

## Layout

- `app/index.html`, `app/style.css` — the page and its look (an original design; no Rockstar logo, artwork or game screenshots anywhere).
- `app/tracker.js` — the checklist, filters, spoiler setting, export/import.
- `app/roadmap.js` — the roadmap view.
- `app/data/trophies.json` — the 55 trophies: official name, description, grade, guide, steps, citation.
- `app/data/roadmap.json` — the seven roadmap stages.
- `screenshots/` — renders of the app's own code in a browser.

## License

MIT — see `LICENSE`.
