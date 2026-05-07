# DingIt Agent Notes

Project-level working rules for this repo.

## Session Records

- Use session-scoped docs for handoff:
  - `docs/DingIt-<session-id>-SESSION_SUMMARY.md`
  - `docs/DingIt-<session-id>-NEXT_SESSION_PROMPT.md`
  - `docs/DingIt-<session-id>-JiraTickets.md`
- Each session file must include:
  - `Session ID`
  - `Session Name`
  - `Session Number`
  - `Date`
- Session summary should include:
  - work topics
  - completed work
  - Jira status
  - open work
- Session summary should also separate:
  - verified work
  - planned work
  - blocked or waiting-on-user work
- Next-session prompt should list upcoming work by topic and label each item with:
  - Jira ticket reference, or
  - `No Jira ticket created`

## Jira Tracking

- Keep Jira tickets in the session ticket registry.
- Keep the Jira section in the session summary concise and linked to the registry.
- Update ticket status in both places when status changes.
- Keep Jira topics aligned with session work topics so the handoff stays readable.

## Verification

- Do not mark UI work done without screenshot checks at:
  - desktop
  - half-width/tablet
  - mobile/phone
- Do not mark importer work done without a smoke test that proves:
  - fresh import or explicit duplicate behavior
  - image handling
  - rendered detail/menu pages
  - log output
- Treat smoke tests as incomplete if they do not cover the real data path end to end.
- Record the verification path in the session summary so the next session can replay it.

## Importer Rules

- Keep Cupertino sample import as the reference dataset for smoke verification.
- Do not treat browser-only import as sufficient when Supabase RLS blocks image writes.
- Prefer a local admin/service-role path for end-to-end smoke verification when needed.

## Work Style

- Open any created or renamed markdown document immediately.
- Keep filenames neutral and session-scoped.
- Keep location-picker work low priority unless the user raises it.
- When a reusable workflow pattern is discovered, update the shared starter kit as well as the repo instructions.
