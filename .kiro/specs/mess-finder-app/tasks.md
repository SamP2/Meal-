# Implementation Plan: Mess Finder App

## Overview

Incremental implementation of the Mess Finder backend (Node.js + Express + Supabase) and React Native (Expo) mobile client. Each task builds on the previous, ending with a fully wired application.

## Tasks

- [ ] 1. Project scaffolding and database setup
  - Initialize Node.js + Express backend project with TypeScript
  - Initialize React Native Expo project
  - Set up Supabase project and run the PostgreSQL schema (profiles, messes, menus, menu_items tables, PostGIS extension, generated location column, indexes)
  - Configure environment variables for Supabase URL, anon key, and JWT secret
  - Set up `fast-check` and a test runner (Jest) in the backend project
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 2. Authentication — backend middleware and auth routes
  - [ ] 2.1 Implement `authenticate` middleware
    - Validate Supabase JWT on every protected request using the Supabase JWT secret
    - Attach `req.user` (id, role) from token claims
    - Return 401 if token is missing or invalid
    - _Requirements: 9.1, 9.4_

  - [ ]* 2.2 Write property test for unauthenticated request rejection (Property 21)
    - **Property 21: Unauthenticated requests are rejected with 401**
    - **Validates: Requirements 9.1**

  - [ ] 2.3 Implement `requireRole(role)` middleware
    - Check `req.user.role` against expected role
    - Return 403 if role does not match
    - _Requirements: 9.2, 9.3, 9.4_

  - [ ]* 2.4 Write property test for role-based access control (Property 22)
    - **Property 22: Role-based access control is enforced**
    - **Validates: Requirements 9.2, 9.3, 9.4**

  - [ ] 2.5 Implement `POST /auth/register` route
    - Accept email, password, role; validate password length ≥ 8; call Supabase Auth to create user; insert row into `profiles` table with role
    - Return session token on success; return 400 for short passwords; return error for duplicate email
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.6_

  - [ ]* 2.6 Write property test for valid registration returns session token (Property 1)
    - **Property 1: Registration with valid credentials returns a session token**
    - **Validates: Requirements 1.1, 2.1**

  - [ ]* 2.7 Write property test for duplicate email rejection (Property 2)
    - **Property 2: Duplicate email registration is rejected**
    - **Validates: Requirements 1.2, 2.2**

  - [ ]* 2.8 Write property test for short password rejection (Property 3)
    - **Property 3: Short passwords are rejected at registration**
    - **Validates: Requirements 1.3, 2.3**

  - [ ]* 2.9 Write property test for every account has exactly one valid role (Property 6)
    - **Property 6: Every registered account has exactly one valid role**
    - **Validates: Requirements 2.6**

  - [ ] 2.10 Implement `POST /auth/login` route
    - Accept email and password; call Supabase Auth sign-in; return session token on success
    - Return opaque error (no field disclosure) on invalid credentials
    - _Requirements: 1.4, 1.5, 2.4, 2.5_

  - [ ]* 2.11 Write property test for login round-trip (Property 4)
    - **Property 4: Login round-trip returns a valid session**
    - **Validates: Requirements 1.4, 2.4**

  - [ ]* 2.12 Write property test for invalid credentials return opaque error (Property 5)
    - **Property 5: Invalid credentials return an opaque error**
    - **Validates: Requirements 1.5, 2.5**

  - [ ]* 2.13 Write unit test for token expiry requiring re-authentication
    - Test that an expired JWT returns 401 on a protected endpoint
    - _Requirements: 1.6_

- [ ] 3. Checkpoint — Ensure all auth tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Mess management — backend routes
  - [ ] 4.1 Implement `POST /messes` route (mess_owner only)
    - Validate required fields (name, address, latitude, longitude, opening_time, closing_time); validate GPS coordinate ranges; insert into `messes` table with `owner_id` from token; default `is_open` to false
    - Return 400 for missing/invalid fields; return created mess object
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 10.5_

  - [ ]* 4.2 Write property test for mess registration round-trip (Property 7)
    - **Property 7: Mess registration round-trip**
    - **Validates: Requirements 3.1, 3.3**

  - [ ]* 4.3 Write property test for missing required fields rejected at mess registration (Property 8)
    - **Property 8: Missing required fields are rejected at mess registration**
    - **Validates: Requirements 3.2**

  - [ ]* 4.4 Write property test for newly created messes default to closed (Property 9)
    - **Property 9: Newly created messes default to closed**
    - **Validates: Requirements 3.5**

  - [ ]* 4.5 Write property test for invalid GPS coordinates rejected (Property 24)
    - **Property 24: Invalid GPS coordinates are rejected**
    - **Validates: Requirements 10.5**

  - [ ] 4.6 Implement `PATCH /messes/:id/status` route (mess_owner only)
    - Verify the requesting owner owns the mess; update `is_open` in DB
    - Return 403 if owner does not own the mess; return updated mess object
    - _Requirements: 4.1, 4.2_

  - [ ]* 4.7 Write property test for owners cannot update other owners' mess status (Property 11)
    - **Property 11: Owners cannot update other owners' mess status**
    - **Validates: Requirements 4.2**

  - [ ] 4.8 Implement `GET /messes/mine` route (mess_owner only)
    - Return all messes owned by the authenticated mess owner
    - _Requirements: 3.3, 3.4_

  - [ ] 4.9 Implement `GET /messes/:id` route (student only)
    - Return full mess details including distance_km when student GPS location is provided as query params
    - Return 404 if mess does not exist
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 4.10 Write property test for mess details response is complete (Property 19)
    - **Property 19: Mess details response is complete**
    - **Validates: Requirements 7.1, 7.3**

  - [ ]* 4.11 Write property test for non-existent mess returns 404 (Property 20)
    - **Property 20: Non-existent mess returns 404**
    - **Validates: Requirements 7.2**

- [ ] 5. Checkpoint — Ensure all mess management tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Nearby mess discovery — backend route
  - [ ] 6.1 Implement `GET /messes/nearby` route (student only)
    - Accept `lat`, `lng`, and optional `radius` (default 2 km) query params
    - Query DB using PostGIS `ST_DWithin` filtering only open messes; sort by distance ascending; return mess list with `distance_km`
    - Return empty list with message when no messes found; return 503 if DB/PostGIS unavailable
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 4.3, 4.4_

  - [ ]* 6.2 Write property test for nearby search returns only messes within radius (Property 17)
    - **Property 17: Nearby search returns only messes within radius**
    - **Validates: Requirements 6.1**

  - [ ]* 6.3 Write property test for nearby search results sorted by distance ascending (Property 18)
    - **Property 18: Nearby search results are sorted by distance ascending**
    - **Validates: Requirements 6.3**

  - [ ]* 6.4 Write property test for open status controls search inclusion (Property 10)
    - **Property 10: Open status controls search inclusion**
    - **Validates: Requirements 4.3, 4.4**

  - [ ]* 6.5 Write unit test for empty nearby search result
    - Test that no messes within radius returns empty list with message
    - _Requirements: 6.4_

- [ ] 7. Menu management — backend routes
  - [ ] 7.1 Implement `PUT /messes/:messId/menu/:date` route (mess_owner only)
    - Validate each menu item (non-empty name, price > 0); replace existing menu atomically (delete-then-insert in a transaction); preserve insertion order via `sort_order`
    - Return 400 for invalid items; return the stored menu object
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 7.2 Write property test for menu storage and retrieval round-trip (Property 12)
    - **Property 12: Menu storage and retrieval round-trip**
    - **Validates: Requirements 5.1, 8.1, 8.3**

  - [ ]* 7.3 Write property test for invalid menu items are rejected (Property 13)
    - **Property 13: Invalid menu items are rejected**
    - **Validates: Requirements 5.2**

  - [ ]* 7.4 Write property test for menu replacement is atomic (Property 14)
    - **Property 14: Menu replacement is atomic**
    - **Validates: Requirements 5.3**

  - [ ] 7.5 Implement `DELETE /messes/:messId/menu/:date` route (mess_owner only)
    - Delete the menu and all its items for the given mess and date
    - Return 404 if no menu exists for that date
    - _Requirements: 5.4_

  - [ ]* 7.6 Write property test for menu deletion removes the menu (Property 15)
    - **Property 15: Menu deletion removes the menu**
    - **Validates: Requirements 5.4**

  - [ ] 7.7 Implement individual menu item routes (mess_owner only)
    - `POST /messes/:messId/menu/:date/items` — add a single item to an existing menu
    - `PATCH /messes/:messId/menu/:date/items/:itemId` — update a single item
    - `DELETE /messes/:messId/menu/:date/items/:itemId` — remove a single item
    - _Requirements: 5.5_

  - [ ]* 7.8 Write property test for partial menu item operations preserve other items (Property 16)
    - **Property 16: Partial menu item operations preserve other items**
    - **Validates: Requirements 5.5**

  - [ ] 7.9 Implement `GET /messes/:messId/menu` route (student only)
    - Accept `date` query param; return menu items sorted by `sort_order`; return empty menu response if no menu set for that date
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 7.10 Write unit test for empty menu response
    - Test that requesting a menu for a date with no menu returns empty response
    - _Requirements: 8.2_

- [ ] 8. Data integrity — cascade delete and FK constraint tests
  - [ ] 8.1 Write unit tests for FK constraint enforcement
    - Test that inserting a menu without a valid mess_id fails
    - Test that inserting a menu_item without a valid menu_id fails
    - Test that inserting a mess without a valid owner_id fails
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ]* 8.2 Write property test for cascade delete removes all associated records (Property 23)
    - **Property 23: Cascade delete removes all associated records**
    - **Validates: Requirements 10.4**

- [ ] 9. Checkpoint — Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Global error handler and error response shapes
  - Implement Express global error handler middleware
  - Map Supabase auth errors to generic messages (never forward raw Supabase errors)
  - Ensure all error responses follow the defined shapes (VALIDATION_ERROR, NOT_FOUND, FORBIDDEN, 503)
  - _Requirements: 9.1, 9.2, 6.2_

- [ ] 11. Mobile client — Auth screens
  - [ ] 11.1 Implement `RegisterScreen`
    - Email/password form with role selector (student | mess_owner)
    - Call `POST /auth/register`; navigate to appropriate home screen on success
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.6_

  - [ ] 11.2 Implement `LoginScreen`
    - Email/password form; call `POST /auth/login`; store session token; navigate to home screen
    - _Requirements: 1.4, 1.5, 2.4, 2.5_

- [ ] 12. Mobile client — Student screens
  - [ ] 12.1 Implement `NearbyMessesScreen`
    - Request GPS permission; display prompt explaining why location is required if denied
    - Call `GET /messes/nearby` with current coordinates; render map (Google Maps) and list of results
    - _Requirements: 6.1, 6.3, 6.4, 6.5_

  - [ ] 12.2 Implement `MessDetailScreen`
    - Call `GET /messes/:id`; display name, address, hours, price range, open status, and distance
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ] 12.3 Implement `MenuScreen`
    - Call `GET /messes/:id/menu?date=YYYY-MM-DD`; display menu items or "no menu available" message
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 13. Mobile client — Mess Owner screens
  - [ ] 13.1 Implement `MyMessesScreen`
    - Call `GET /messes/mine`; list owner's messes with links to manage each
    - _Requirements: 3.3, 3.4_

  - [ ] 13.2 Implement `RegisterMessScreen`
    - Form for name, address, GPS coordinates, opening time, closing time, price range
    - Call `POST /messes`; navigate to `MyMessesScreen` on success
    - _Requirements: 3.1, 3.2, 3.5_

  - [ ] 13.3 Implement `ManageMessScreen`
    - Toggle open/close status via `PATCH /messes/:id/status`
    - Navigate to `MenuManagementScreen`
    - _Requirements: 4.1, 4.2_

  - [ ] 13.4 Implement `MenuManagementScreen`
    - Date picker; load existing menu via `GET /messes/:messId/menu`
    - Add/edit/delete individual items via item-level routes; replace full menu via `PUT /messes/:messId/menu/:date`; delete menu via `DELETE /messes/:messId/menu/:date`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 14. Final checkpoint — Wire everything together and ensure all tests pass
  - Connect mobile client to backend API base URL via environment config
  - Verify navigation flows for both student and mess owner roles end-to-end
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with a minimum of 100 iterations each
- Each property test must include the comment: `// Feature: mess-finder-app, Property <N>: <property_text>`
- Checkpoints ensure incremental validation before moving to the next layer
