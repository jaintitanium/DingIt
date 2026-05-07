# Location Picker Enhancements

## Title
Allow location selection from IP, search, and current location

## Summary
Improve the restaurant search experience so the app can infer a likely location from the user's IP address, let the user search for a location, and provide a current-location button.

## Scope
- Detect a probable location from IP address on load when possible.
- Add a searchable location field.
- Add a current-location button that uses browser geolocation when permitted.
- Show the selected location prominently above the search results.
- Let the user change the selected location at any time.
- Keep the selected location synchronized across the search and browse flow.

## Acceptance Criteria
- The app defaults to an inferred location when available.
- Users can override the location by searching.
- Users can press a current-location button to re-center on their present location.
- The selected location is visible at the top of the search experience.
- Changing the location updates the displayed restaurant results accordingly.
- If IP lookup or browser geolocation fails, the app continues to function.

## Implementation Notes
- This should work in the local app first.
- Geo/IP lookup should fail gracefully.
- Browser permission denial should not block search.
- Persist the selected location in the app state so list views and search use the same location.
