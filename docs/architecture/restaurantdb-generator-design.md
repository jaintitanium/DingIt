# RestaurantDB and RestaurantDataGenerator Design

## Goal

Create a separate restaurant data platform for DingIt that is independent from the main app database and runs as its own background process. The first implementation can be an Azure Function App or equivalent worker, with its own database and queue-driven workflow.

## Why this exists

- The current DingIt app should not keep growing source-ingestion logic inside the UI.
- Restaurant ingestion needs to scale across cities and multiple data sources.
- We need to track where restaurant data came from.
- We need a clean way to reimport a restaurant without rebuilding the whole city.
- The system should support more sources later, not only Google Maps.

## Core decision

- Main DingIt app database and RestaurantDB are separate.
- RestaurantDB is the canonical store for imported restaurant discovery data.
- A separate process owns fetching, enrichment, dedupe, and refresh work.
- The main app only consumes curated restaurant records from RestaurantDB or a downstream sync.

## Proposed components

### 1. RestaurantDB

Owns the data model for:

- cities
- restaurant import requests
- restaurant discovery jobs
- canonical restaurant records
- source records and source snapshots
- media and provenance
- reimport state

This database is where we keep the city list and the restaurant list for each city.

### 2. RestaurantDataGenerator process

A separate process that:

- receives a city request
- creates a city discovery job
- discovers restaurants for the city
- fetches details for each restaurant
- stores source data and media references
- marks records complete or failed

This can start as an Azure Function App with queue triggers and HTTP endpoints. A background worker service would also work, but Azure Functions matches the intended deployment path.

### 3. Source adapters

Each upstream provider becomes a source adapter:

- Google Maps / Places
- DoorDash
- Yelp
- direct merchant-provided feeds
- future sources as needed

The generator should not hardcode Google logic into the data model. Google is just the first adapter.

## Data model

### city

Represents a city or geo area to generate data for.

Suggested fields:

- `city_id`
- `city_name`
- `state`
- `country`
- `status`
- `created_at`
- `updated_at`

### city_request

Represents a request from a user or operator to generate a city.

Suggested fields:

- `request_id`
- `city_id`
- `requested_count`
- `source_priority`
- `refresh_mode`
- `requested_by`
- `requested_at`
- `status`
- `notes`

### restaurant

Canonical restaurant record. This is the stable restaurant entity in RestaurantDB.

Suggested fields:

- `restaurant_id`
- `city_id`
- `display_name`
- `address_1`
- `address_2`
- `city`
- `state`
- `postal_code`
- `phone_number`
- `website`
- `timezone`
- `lat`
- `lng`
- `status`
- `created_at`
- `updated_at`

### restaurant_source

Tracks where a restaurant came from and how it maps back to upstream data.

Suggested fields:

- `restaurant_source_id`
- `restaurant_id`
- `source_code`
- `source_external_id`
- `source_url`
- `source_rank`
- `fetched_at`
- `last_checked_at`
- `reimport_requested`
- `reimport_reason`
- `status`

### restaurant_source_snapshot

Stores the actual source payload or a normalized snapshot so provenance is auditable.

Suggested fields:

- `snapshot_id`
- `restaurant_source_id`
- `payload_json`
- `payload_hash`
- `fetched_at`
- `fetched_by_job_id`

### restaurant_media

Tracks images and other media separately from the restaurant row.

Suggested fields:

- `media_id`
- `restaurant_id`
- `source_code`
- `media_type`
- `source_url`
- `local_path`
- `content_hash`
- `width`
- `height`
- `status`

### import_job

Tracks each background run.

Suggested fields:

- `job_id`
- `city_id`
- `job_type`
- `status`
- `started_at`
- `finished_at`
- `error_count`
- `summary_json`

## Workflow

### City generation

1. User requests a city.
2. The UI writes a `city_request`.
3. The generator creates an `import_job`.
4. The generator resolves the city and discovers candidate restaurants.
5. Each candidate becomes a canonical `restaurant` record if it is new.
6. Each provider/source mapping is written into `restaurant_source`.
7. The raw or normalized payload is written to `restaurant_source_snapshot`.
8. Media is linked through `restaurant_media`.
9. The job is marked complete.

### Reimport a restaurant

1. User marks a restaurant for reimport.
2. The system sets `restaurant_source.reimport_requested = true` or queues a refresh job.
3. The generator refetches that restaurant from the selected source.
4. A new snapshot is saved.
5. The canonical restaurant row is updated only if the new data passes validation.

### Refresh a city

1. User requests a full city refresh.
2. The generator revisits all restaurants for that city.
3. Existing restaurant-source mappings are updated.
4. New restaurants can be added.
5. Removed or obsolete restaurants should be marked inactive instead of disappearing unless the user explicitly asks for a destructive reset.

## Deduplication rules

Deduplication should happen at two levels:

- within a source, using that source's external id or place id
- across sources, using normalized name/address/geo heuristics

Preferred matching order:

1. exact source external id
2. exact normalized address + city + state
3. nearby geo match plus similar display name

The design should preserve duplicates as separate source records if the source evidence is different, but canonical restaurant records should remain one-per-restaurant.

## Provenance rules

Every restaurant row must know:

- which source created it
- when the source was fetched
- which job fetched it
- whether the data is stale
- whether a reimport is pending

That gives us auditability and lets us explain why a restaurant exists.

## Reimport policy

When a user wants a restaurant refetched:

- they do not delete it by default
- they mark it for reimport
- the next job refreshes source data
- the current canonical row is updated after validation

When a user wants a full restaurant reset:

- that should be an explicit destructive operation
- it can replace all restaurants for a city
- it should be gated behind a stronger confirmation

## Integration with DingIt

The main DingIt app should eventually consume RestaurantDB through a service API, not by directly calling Google Maps or other source APIs.

That keeps the main app focused on:

- browsing
- search
- curation
- restaurant display
- user interactions

The generator stays responsible for:

- discovery
- refresh
- provenance
- media acquisition
- source-specific normalization

## Suggested implementation phases

### Phase 1

- Create RestaurantDB schema
- Add city/request/job tables
- Add restaurant canonical + source tables
- Add a local worker that can process one city request

### Phase 2

- Turn the worker into an Azure Function App
- Add queue-driven processing
- Add job history and admin status views
- Add restaurant reimport flags

### Phase 3

- Add Google Maps source adapter
- Add provenance snapshots
- Add image/media tracking
- Add partial refresh rules

### Phase 4

- Add DoorDash and other source adapters
- Add source selection / priority rules
- Add city refresh and restaurant refresh UI
- Sync curated data into the DingIt app if needed

## Open questions

- Should RestaurantDB be PostgreSQL or Azure SQL?
- Should the generator run on a queue, cron, or both?
- Should refresh keep history for every old payload or only the latest snapshot?
- How aggressive should cross-source dedupe be?
- Should the main DingIt app read RestaurantDB directly or through a sync API?

