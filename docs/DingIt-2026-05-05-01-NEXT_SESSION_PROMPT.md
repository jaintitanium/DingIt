# DingIt Next Session Prompt

Session ID: `DingIt-2026-05-05-01`
Session Name: `Session 01`
Session Number: `01`
Date: `2026-05-05`

Use this as the handoff context for the next work session.

## Project State

- Repo: `F:\Projects\DingIt\source\DingIt`
- Web app runs locally in Docker at `http://localhost:8080`
- Local Supabase is the backend at `http://127.0.0.1:54321`
- Local import log service runs at `http://localhost:8091/import-logs`
- Jira project key is `UTI`
- Current work is intentionally local-first and not ready for release
- Shared reusable starter kit lives at `F:\Projects\codex\starter-kit\`

## What Was Completed

- The Cupertino sample import is complete for the current test set.
- The sample used is `docs/import-data/imports/samples/sample-cupertino-restaurants-with-images.csv`
- The image folder used by the smoke is `docs/import-data/imports/generated/images`
- Fresh Cupertino rows were imported through a local admin path using a service-role token.
- The smoke verified:
  - 10 restaurant rows imported
  - header images and promo images were written
  - product rows were written
  - restaurant detail pages render images
  - menu pages render images
  - the logs tab loads and shows run history/detail
- Responsive screenshots were taken at desktop, half-width tablet, and mobile sizes.
- The Import Data page now stays inside the viewport and does not bleed beyond the visible content area.
- Supabase auth navigator-lock contention was bypassed in the local app client so Playwright can log in reliably.

## Important Implementation Details

- `app/src/app/services/api.service.ts`
  - Supabase client now uses a no-op auth lock for local browser smoke stability.
- `Utilities/import-data-smoke.js`
  - Smoke test now performs a local admin import path and then uses Playwright only for UI/render verification.
- `app/src/app/pages/settings/import-data/import-data.page.scss`
  - Responsive layout was tightened so KPI cards, Current Run, and Import Preview fit inside the viewport.
- `docs/DingIt-2026-05-05-01-SESSION_SUMMARY.md`
  - Updated with the final verified state.
- `docs/DingIt-2026-05-05-01-JiraTickets.md`
  - Jira ticket registry for this session, including the current Epic, tasks, and importer work.
- `F:\Projects\codex\starter-kit\`
  - Shared templates for future projects: repo instructions, session summary, next-session prompt, Jira registry, and bootstrap checklist.

## Current Data State

- The 10 Cupertino restaurants were cleaned and re-imported during smoke testing.
- Image paths now exist in `service_provider` rows for all 10 Cupertino restaurants.
- Product rows exist for the sample data set.
- Import logs are stored as JSON files in `docs/import-data/logs`.

## Next Work To Do

1. Decide whether to keep the local admin-import smoke path or move the image import behind a real backend/admin endpoint. No Jira ticket created.
2. Continue the RestaurantDB and RestaurantDataGenerator design as a separate process. Jira: `UTI-37`, `UTI-39`.
3. Add source provenance tracking so future restaurant imports can come from Google Maps, DoorDash, and other sources. Jira: `UTI-39`.
4. Design the reimport workflow so user-flagged restaurants can be refreshed without creating duplicates. Jira: `UTI-38`.
5. Decide whether to split web, API, and background jobs into separate repos. No Jira ticket created.
6. Keep location picker work low priority for now. No Jira ticket created.

## Do Not Re-Do

- Do not re-run the old no-image Cupertino sample as the primary success case.
- Do not claim the browser-only import path is sufficient for image-bearing imports; it is RLS-limited.
- Do not delete the current sample data unless the next task explicitly requires another clean verification run.

## Useful Commands

- Build web app: `npm run build -- --configuration development` from `app`
- Run smoke: `node import-data-smoke.js` from `Utilities`
- Check local import logs: `http://localhost:8091/import-logs`
- Reset Cupertino sample data in Supabase: use the same delete pattern from the last smoke cycle if needed
