# Blackstone Fortress

Hostile behaviour tracker for [Warhammer Quest: Blackstone
Fortress](https://boardgamegeek.com/boardgame/264198/warhammer-quest-blackstone-fortress).

Pick your explorers and build enemy groups, then roll each hostile's behaviour chart to get the
action it takes and the rules text for it. A TypeScript rewrite of the original Blazor WebAssembly
app, which lives alongside this one in `../blazor`.

## Commands

```bash
npm install
npm run dev         # http://localhost:5173/blackstone-fortress/
npm test            # Vitest
npm run typecheck   # react-router typegen && tsc
npm run build       # prerenders every route into build/client
```

## Adding an enemy

Drop a JSON file into `app/data/enemies/`. It is picked up automatically — there is no registry to
update. The shape is the same as the Blazor app's `wwwroot/enemy-data`:

```json
{
  "Name": "Traitor Guard",
  "BehaviourChartColumns": [
    { "Status": "Engaged", "Actions": [{ "From": 1, "To": 3, "ActionTaken": "Fall Back" }] }
  ]
}
```

Every `ActionTaken` needs a matching entry in `app/data/enemy-actions.json`, or the card shows no
rules text. `tests/data-integrity.test.ts` enforces this, along with checking that all 20 faces
resolve on every column of every enemy.

## Deployment

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on push to `main`. Enable Pages
with the "GitHub Actions" source in repository settings.

Every route is prerendered to static HTML, so deep links work on Pages without a hash router. The
`basename` in `react-router.config.ts` and `base` in `vite.config.ts` must both match the repo name;
`scripts/postbuild.mjs` reconciles the resulting directory layout.
