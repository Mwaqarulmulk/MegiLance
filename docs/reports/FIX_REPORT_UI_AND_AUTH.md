# Fix Report: UI Glitches and Backend Connectivity

## 1. Services Dropdown Fix
**Issue:** The "Services" dropdown in the navigation bar was closing instantly when moving the cursor from the trigger to the menu.
**Cause:** There was a physical gap between the button and the dropdown menu, causing a `mouseleave` event.
**Fix:** Added a transparent bridge using `::before` pseudo-element in `PublicHeader.common.module.css` to maintain the hover state.

## 2. AI-Powered Platform Flickering Fix
**Issue:** The feature cards in the "AI-Powered Platform" section were flickering when hovered.
**Cause:** The 3D transform effects on the card were moving the element away from the cursor, triggering `mouseleave`, which reset the transform, causing a loop (flicker).
**Fix:** 
- Modified `PoweredByAI.tsx` to wrap the card in a static container (`.featureCardWrapper`) that handles hover events.
- Updated `PoweredByAI.common.module.css` to apply the transform to the inner card while the wrapper stays in place.

## 3. "Failed To Fetch" Error Fix
**Issue:** Login and Signup requests were failing with "Failed to fetch".
**Cause:** The backend server was down/crashed.
**Fix:** Restarted the backend server using `fyp_main.py` which correctly loads the API routes. Verified connectivity to `/api/live` and `/api/auth/login`.

## Verification
- **Dropdown:** Hover over "Services" -> Menu stays open.
- **AI Section:** Hover over cards -> Smooth 3D effect, no flickering.
- **Auth:** Login/Signup requests should now reach the server (check network tab for 200/400 responses instead of network error).
