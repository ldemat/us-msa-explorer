# MSA Explorer

Interactive map and sortable directory of all 387 U.S. metropolitan statistical areas, grouped by Census region and division and powered by official Census Bureau Vintage 2025 metropolitan and combined statistical area tables.

## Features

- Sortable directory of all 387 Metropolitan Statistical Areas.
- Interactive SVG/D3 point map using local Census Gazetteer coordinates, with no external map-tile dependency.
- Filters for state, population range, Census region, and Combined Statistical Area.
- Search across MSA title, CBSA code, state, region, division, and CSA.
- Click any map bubble or directory row to open the detail panel with full MSA title, 2020 and 2025 population, change, percent change, and parent CSA.
- Dark-mode capable civic/data-intelligence interface.

## Data sources

The app uses the prepared dataset at `client/src/data/msa_dataset.json`, derived from:

- Census Bureau metropolitan and micropolitan statistical area population estimates page: https://www.census.gov/data/tables/time-series/demo/popest/2020s-total-metro-and-micro-statistical-areas.html
- CBSA-EST2025-ALLDATA: https://www2.census.gov/programs-surveys/popest/datasets/2020-2025/metro/totals/cbsa-est2025-alldata.csv
- CSA-EST2025-ALLDATA: https://www2.census.gov/programs-surveys/popest/datasets/2020-2025/metro/totals/csa-est2025-alldata.csv
- 2025 CBSA Gazetteer coordinates: https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2025_Gazetteer/2025_Gaz_cbsa_national.zip

The 2020 population value is the April 1, 2020 Census estimates base from the official CBSA table. The 2025 population value is the July 1, 2025 estimate.

## Local development

Prerequisites:

- Node.js 20 or newer
- npm

Install dependencies:

```bash
npm ci
```

Run the development server:

```bash
npm run dev
```

Run type checking:

```bash
npm run check -- --noEmit
```

Build the static site:

```bash
npm run build
```

The static build output is written to:

```text
dist/public
```

## Deploy to GitHub Pages

This repository includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml`.

1. Create a new GitHub repository.
2. Upload or push this project to the repository.
3. In GitHub, open `Settings` → `Pages`.
4. Under `Build and deployment`, set `Source` to `GitHub Actions`.
5. Push to the `main` branch, or run the `Deploy to GitHub Pages` workflow manually.

The workflow installs dependencies, type-checks the project, builds the static app, and publishes `dist/public` to GitHub Pages. The Vite configuration uses `base: "./"` so compiled assets work correctly when served from a repository subpath such as `https://<user>.github.io/<repo>/`.

## Project structure

```text
client/
  index.html
  src/
    App.tsx
    index.css
    data/msa_dataset.json
server/
shared/
script/
.github/workflows/deploy-pages.yml
vite.config.ts
package.json
```

The current app is effectively static. The Express server files remain from the build template, but the GitHub Pages deployment uses only the static `dist/public` output.
