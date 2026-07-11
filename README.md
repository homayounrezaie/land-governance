# Land Governance Explorer

An interactive research dashboard for agricultural change, public land, parcel-reference coverage, and aggregated farm indicators in Ontario, Alberta, and Saskatchewan.

## Public data scope

This repository contains only the optimized data required by the web application in `public/data/`. It does **not** contain the project’s raw dataset, registry samples, internal logs, licensing requests, or Indigenous/shared source files.

Current public layers include:

- AAFC Crop Inventory for 2011 and 2024;
- Statistics Canada province boundaries and province-level farmland values;
- generalized Canada Land Inventory agricultural capability;
- municipal/township and partial parcel-reference geometry;
- selected Ontario and Saskatchewan Crown/public-land records;
- aggregated Statistics Canada farm-size, tenure, operator, value, and succession indicators.

Niagara Falls parcel geometry is city-only. Edmonton data are city-only assessment centroids. Neither represents province-wide ownership. Owner names and historical transactions are not included.

Indigenous/treaty administrative derivatives are intentionally excluded pending governance direction from Chiefs of Ontario and participating Nations.

## Development

```bash
npm ci
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

Vite uses relative asset paths so the build works under a GitHub Pages repository subdirectory.

## Deployment

Pushes to `main` run `.github/workflows/deploy-pages.yml`, build the Vite application, and deploy `dist/` to GitHub Pages.

## Research limitations

This dashboard provides geographic and aggregated statistical context. It is not a legal survey, title system, parcel-owner database, or transaction registry. Do not use its municipal samples to make province-wide ownership claims.
