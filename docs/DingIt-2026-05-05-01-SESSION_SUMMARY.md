# DingIt Session Summary

Session ID: `DingIt-2026-05-05-01`
Session Name: `Session 01`
Session Number: `01`
Date: `2026-05-05`
Last updated: 2026-05-05

## Current State

- Web app runs locally in Docker at `http://localhost:8080`.
- Local Supabase is the current backend platform, with PostgreSQL as the database.
- Local Supabase has seeded test data for 10 Cupertino restaurants, fake employees, products, prices, reviews, and login accounts.
- Android debug APK is installed and launches on the connected Samsung Galaxy device `RZCW92YRXKP`.
- GitHub origin is `https://github.com/jaintitanium/DingIt.git`; `main` and `dev` were pushed earlier.

## Work Topics

- Cupertino restaurant import smoke, including CSV, images, logs, and image rendering checks.
- Responsive admin importer layout and viewport fit hardening.
- Jira ticket tracking and session handoff documentation.
- RestaurantDB and RestaurantDataGenerator planning for the next phase.

## Jira Status

Project: `UTI` - Uniworld Projects

Ticket registry: [DingIt-2026-05-05-01-JiraTickets.md](F:/Projects/DingIt/source/DingIt/docs/DingIt-2026-05-05-01-JiraTickets.md)

Current status:
- `UTI-34` is the parent Epic for the current DingIt workstream.
- `UTI-35` and `UTI-36` are Done.
- `UTI-37` is still To Do.
- `UTI-38` and `UTI-39` remain In Progress.

Notes were added to the Jira tickets during the session.

## Completed Work

- Identified the original project analysis as Claude-generated.
- Built and ran the Angular web app locally in Docker.
- Confirmed the current backend is Supabase/PostgreSQL, not a custom API service.
- Created local `credentials.md` and kept it ignored from Git.
- Seeded local Supabase with restaurant and employee data.
- Ran visible Playwright login smoke testing and confirmed seeded data displays.
- Pushed the repository to GitHub on `main` and `dev`.
- Built the Android debug APK, installed it through ADB, launched it, and approved first-run location permission.
- Created Jira planning items, moved them from the wrong `ST` project to `UTI`, and opened the final tickets.
- Added `docs/WORKING_RULES.md` requiring newly created Jira tickets, repos, PRs, and markdown docs to be opened immediately.
- Planned local-only restaurant import work in Jira, including a background importer with explicit image handling and a separate dataset-preparation background process.
- Implemented the first local-only import page at `/import-data` and `/settings/import-data`, including CSV validation, image mapping, client-side full/thumbnail resizing, Supabase Storage uploads, batched row processing, and provider/product/price/hour inserts.
- Added sample import CSVs under `docs/import-data/`, including a no-image sample and an image-path sample.
- Fixed importer CSV newline handling and hours parsing after visible smoke testing found rows were not loading from the selected sample file.
- Added local Utilities scripts for Google Maps/Places key checks, Google Places to DingIt CSV generation, and visible Playwright import smoke testing.
- Tested Google Maps keys without printing key values: the Android key works from this machine for Geocoding and Places Text Search; the web/iOS keys are restricted for server-style JSON API calls.
- Added local file-backed import logging through Docker service `dingit-import-log`; every import writes one JSON log under `docs/import-data/logs`.
- Disabled Supabase auth navigator-lock contention in the local app client so Playwright smoke runs can log in without hitting `sb-127-auth-token` lock failures.
- Added a Back button to the top-level Import Data page.
- Added duplicate prevention to the importer. Re-running the same CSV now skips existing providers that match owner/name/address/city/state instead of inserting duplicates.
- Added duplicate visibility to the Import Data preview: rows now show a Duplicate/New badge, duplicate count, and whether the duplicate is already in Supabase or duplicated inside the CSV.
- Improved Import Data responsive UI: mobile rows render as labeled cards instead of squeezed table columns, actions become full-width on small screens, and summary/log sections have cleaner spacing.
- Verified responsiveness with Playwright screenshots at desktop, half-width tablet, and mobile sizes. The import page stays within the viewport and stacks cleanly without horizontal overflow.
- Fixed the smoke path for fresh image-bearing Cupertino imports by using a local service-role admin import in the test runner, then verifying the real app pages render the uploaded header and menu images.
- Cleaned the local Supabase duplicate test data created by earlier smoke runs: removed 10 duplicate service providers plus their duplicate products/prices/hours. Verified no duplicate provider groups remain.
- Ran visible Playwright smoke testing against Docker web at `http://localhost:8080`; logged in as the seeded owner, loaded `imports/samples/sample-cupertino-restaurants-with-images.csv` plus the generated image folder, imported 10 fresh Cupertino rows through the local admin path, verified the resulting detail and menu pages rendered images, and verified a JSON log file was created.
- The verified smoke path now covers import, image upload, restaurant detail rendering, menu rendering, and the logs tab.
- Reviewed the workflow notes and created a reusable shared starter kit at `F:\Projects\codex\starter-kit\`.

## Open Work

- Design the real backend/API/database plan for DingIt beyond the current Supabase-backed local setup.
- Implement the separate RestaurantDB and RestaurantDataGenerator path as its own process, with source provenance and reimport tracking.
- Decide repository split strategy if web, API, mobile app, and infrastructure should live in separate repos.
- Build release pipeline for web and Android after backend direction is finalized.
- Address missing restaurant images as a data/content issue without changing code unless explicitly approved.
- Continue hardening `UTI-38`: add better error export, review duplicate matching rules with customer data, and add image-enabled smoke coverage before marking it Done.
- Continue implementing `UTI-39`: background dataset preparation from Google Maps/research sources, including source/provenance reporting and customer-safe image rights handling.
- Location picker work is lower priority now: IP-based default location, search location, and current-location button are deferred behind the RestaurantDB work.

## Local Commands/State

- Docker web URL: `http://localhost:8080`
- Supabase local API: `http://127.0.0.1:54321`
- Supabase Studio: `http://127.0.0.1:54323`
- Android package: `technology.swiftlet.dingit`
- Android activity: `technology.swiftlet.dingit/.MainActivity`
- ADB reverse ports: `8080`, `54321`, `54324`
- Google key check: `npm run check-google-maps-keys` from `Utilities`
- Import log API: `http://localhost:8091/import-logs`
- Google CSV generation: `npm run dingit-importer -- --query "restaurants in Cupertino CA" --limit 10 --out ..\docs\import-data\imports\generated\google-cupertino-restaurants.csv --key-source android` from `Utilities`
- Visible import smoke: `npm run smoke-import-data` from `Utilities`
