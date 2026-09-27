# French section — quality checks

## Result

- `npm run build`: passed on the final source, including all 128 static pages and all 11 French routes.
- `npx tsc --noEmit`: passed on the initial implementation; the final production build repeated type validation successfully.
- `npx next lint --dir src/app/fr --dir src/components/french --file src/lib/frenchSeo.ts`: passed. Final build lint also passed for changed files.
- `node docs/seo/validate-fr.cjs`: passed against the final production server on localhost:3000. Exact metadata, content counts, schema and link results are in `fr-validation.json` and `fr-final-report.md`.
- `git diff --check`: passed.
- Browser checks: all 11 routes checked at desktop and mobile widths; no document overflow; CTA within tested first screen; first FAQ on every route expands and reveals its answer. Browser error log was empty at final inspection. See `fr-browser-checks.md`.
- Final screenshots: `screenshots/fr-excel-desktop.png`, `screenshots/fr-excel-mobile.png`, `screenshots/fr-csv-reference.png`.

## Issues found and fixed during validation

- First build exposed a missing tool-choice hero panel; added it, then rebuilt successfully.
- Screenshot inspection exposed a shared font-variable inheritance issue causing a serif fallback. Applied the existing Inter variable at the French page boundary; final screenshots and computed styles confirm sans-serif typography.
- The validation parser initially treated HTML attributes as case-sensitive. Normalized attribute names so Next.js `hrefLang` output is validated correctly.
- Repository ignores JSON globally. Added narrow exceptions for the authored French content and audit JSON so all required files are available in version control.

## Existing warnings and scope limits

- Full build reports an existing `react-hooks/exhaustive-deps` warning in `src/components/app/PreviewWorkspace.tsx:27`. That file is unchanged.
- Full build reports the existing edge-runtime/static-generation warning for other routes. All French landing routes remain static.
- No files in converter, authentication, payment, pricing, API, export or persistence logic were modified. Navigation links point to the existing application.
- The shared root document language and inherited global pricing schema need a separate site-wide review, as explained in the final report.
- No production deployment, bank-document upload, payment, Search Console access or ranking/CTR measurement was performed.
- The legacy `generate_french_pages.js` generator is not part of the new editorial workflow; rerunning it would overwrite the route wrappers. Maintain French text in `src/content/fr` and presentation in `src/components/french`.

## Reproduce the SEO checks

Run `npm run build`, then `npm start -- --port 3000` in a separate terminal. Run `node docs/seo/validate-fr.cjs`. Set `FR_AUDIT_BASE` to another local origin if needed. This audit reads routes and files only; it does not submit forms or exercise conversion/payment actions.
