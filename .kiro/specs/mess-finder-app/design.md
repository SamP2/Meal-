# Design Document: Mess Finder App

## Overview

Mess Finder is a two-sided mobile platform connecting university students with nearby messes (local canteens/food stalls). The system has two user roles — students and mess owners — each with distinct capabilities.

Students can discover messes near their GPS location, view mess details, and browse daily menus. Mess owners can register their mess, manage open/close status, and update daily menus.

V1 scope excludes payments and subscriptions. The architecture is a React Native (Expo) mobile client backed by a Node.js + Express REST API, with PostgreSQL on Supabase for persistence and Supabase Auth for identity management.

---

## Architecture

```mermaid
graph TD
    subgraph Mobile Client (React Native / Expo)
        A[Student UI]
        B[Mess Owner UI]
        C[Auth Screen]
    end

    subgraph Backend (Node.js + Express)
        D[Auth Middleware]
        E[Auth Routes]
        F[Mess Routes]
        G[Menu Routes]
        H[Discovery Routes]
    end

    subgraph Supabase
        I[Supabase Auth]
        J[PostgreSQL DB]
    end

    K[Google Maps API]

    A --> D
    B --> D
    C --> E
    E --> I
    D --> F
    D --> G
    D --> H
    F --> J
    G --> J
    H --> J
    H --> K
```

### Key Design Decisions

- Supabase Auth handles all identity and JWT issuance. The Express API validates JWTs on every protected request using the Supabase JWT secret.
- Role (`student` | `mess_owner`) is stored in the Supabase Auth `user_metadata` field at registration time and embedded in the JWT claims. The API reads the role from the token — no extra DB lookup needed per request.
- GPS proximity search is done in PostgreSQL using the PostGIS `ST_DWithin` function (available via Supabase). Google Maps API is used on the client side for map rendering and reverse geocoding, not for server-side distance queries. This avoids a Maps API call on every search request and keeps latency low.
- Menu replacement (Requirement 5.3) is implemented as a delete-then-insert within a single DB transaction to ensure atomicity.

---

## Components and Interfaces

### Mobile Client

**Auth Screens**
- `RegisterScreen` — email/password form, role selector (student | mess_owner)
- `LoginScreen` — email/password form

**Student Screens**
- `NearbyMessesScreen` — requests GPS, calls `GET /messes/nearby`, renders map + list
- `MessDetailScreen` — calls `GET /messes/:id`, shows name, address, hours, price range, open status, distance
- `MenuScreen` — calls `GET /messes/:id/menu?date=YYYY-MM-DD`, shows menu items

**Mess Owner Screens**
- `MyMessesScreen` — lists owner's messes, links to manage each
- `RegisterMessScreen` — form to create a new mess
- `ManageMessScreen` — toggle open/close, navigate to menu management
- `MenuManagementScreen` — add/edit/delete menu items for a selected date

### Backend API

#### Auth Routes (`/auth`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register student or mess owner |
| POST | `/auth/login` | Login, returns JWT session |

#### Mess Routes (`/messes`)

| Method | Path | Auth Role | Description |
|--------|------|-----------|-------------|
| POST | `/messes` | mess_owner | Register a new mess |
| GET | `/messes/nearby` | student | Get messes within radius of GPS coords |
| GET | `/messes/:id` | student | Get mess details |
| PATCH | `/messes/:id/status` | mess_owner | Update open/close status |
| GET | `/messes/mine` | mess_owner | List owner's own messes |

#### Menu Routes (`/messes/:messId/menu`)

| Method | Path | Auth Role | Description |
|--------|------|-----------|-------------|
| PUT | `/messes/:messId/menu/:date` | mess_owner | Replace full menu for a date |
| GET | `/messes/:messId/menu` | student | Get menu for a mess and date |
| DELETE | `/messes/:messId/menu/:date` | mess_owner | Delete menu for a date |
| POST | `/messes/:messId/menu/:date/items` | mess_owner | Add a single item to existing menu |
| PATCH | `/messes/:messId/menu/:date/items/:itemId` | mess_owner | Update a single menu item |
| DELETE | `/messes/:messId/menu/:date/items/:itemId` | mess_owner | Remove a single menu item |

### Middleware

- `authenticate` — validates Supabase JWT, attaches `req.user` (id, role)
- `requireRole(role)` — checks `req.user.role` matches expected role, returns 403 otherwise

---

## Data Models

### PostgreSQL Schema

```sql
-- Profiles table mirrors Supabase Auth users and stores role
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('student', 'mess_owner')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messes
CREATE TABLE messes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  address       TEXT NOT NULL,
  latitude      DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude     DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  opening_time  TIME NOT NULL,
  closing_time  TIME NOT NULL,
  price_range   TEXT,
  is_open       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable PostGIS for proximity search
CREATE EXTENSION IF NOT EXISTS postgis;
ALTER TABLE messes ADD COLUMN location GEOGRAPHY(POINT, 4326)
  GENERATED ALWAYS AS (ST_MakePoint(longitude, latitude)) STORED;
CREATE INDEX messes_location_idx ON messes USING GIST (location);

-- Menus (one per mess per date)
CREATE TABLE menus (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mess_id   UUID NOT NULL REFERENCES messes(id) ON DELETE CASCADE,
  date      DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (mess_id, date)
);

-- Menu Items
CREATE TABLE menu_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id    UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  price      NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### API Response Shapes

**Mess object**
```json
{
  "id": "uuid",
  "name": "string",
  "address": "string",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "opening_time": "08:00",
  "closing_time": "22:00",
  "price_range": "₹50–₹100",
  "is_open": true,
  "distance_km": 0.45
}
```

**Menu object**
```json
{
  "date": "2024-01-15",
  "items": [
    { "id": "uuid", "name": "Dal Rice", "price": 60 },
    { "id": "uuid", "name": "Roti Sabzi", "price": 50 }
  ]
}
```


---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Registration with valid credentials returns a session token

*For any* role (`student` or `mess_owner`) and any valid email/password pair, submitting a registration request should return a non-empty session token and the account should be retrievable.

**Validates: Requirements 1.1, 2.1**

---

### Property 2: Duplicate email registration is rejected

*For any* role and any email address, if that email is already registered, a second registration attempt with the same email should return an error — regardless of the password used.

**Validates: Requirements 1.2, 2.2**

---

### Property 3: Short passwords are rejected at registration

*For any* role and any password string with length less than 8 characters, the registration request should be rejected with a validation error before any account is created.

**Validates: Requirements 1.3, 2.3**

---

### Property 4: Login round-trip returns a valid session

*For any* role and any valid (email, password) pair that was used to register, submitting those same credentials to the login endpoint should return a valid session token.

**Validates: Requirements 1.4, 2.4**

---

### Property 5: Invalid credentials return an opaque error

*For any* role and any (email, password) pair where either the email is not registered or the password is wrong, the error response body should not reveal which specific field caused the failure.

**Validates: Requirements 1.5, 2.5**

---

### Property 6: Every registered account has exactly one valid role

*For any* registered user, the role claim embedded in their session token should be exactly one of `student` or `mess_owner` — never both, never neither, never an unrecognized value.

**Validates: Requirements 2.6**

---

### Property 7: Mess registration round-trip

*For any* authenticated mess owner and any valid mess payload (name, address, GPS coordinates, opening time, closing time), submitting a registration request should result in a mess record that is retrievable and whose `owner_id` matches the authenticated user's ID.

**Validates: Requirements 3.1, 3.3**

---

### Property 8: Missing required fields are rejected at mess registration

*For any* mess registration payload with at least one required field (name, address, latitude, longitude, opening_time, closing_time) omitted, the API should return a validation error identifying the missing field.

**Validates: Requirements 3.2**

---

### Property 9: Newly created messes default to closed

*For any* newly registered mess, the `is_open` field should be `false` immediately after creation, regardless of the owner or mess data provided.

**Validates: Requirements 3.5**

---

### Property 10: Open status controls search inclusion

*For any* mess within the search radius, if its `is_open` is `true` it should appear in the nearby search results; if its `is_open` is `false` it should not appear in the default nearby search results.

**Validates: Requirements 4.3, 4.4**

---

### Property 11: Owners cannot update other owners' mess status

*For any* two distinct mess owner accounts A and B, if owner A attempts to update the `Open_Status` of a mess owned by owner B, the API should return a 403 authorization error.

**Validates: Requirements 4.2**

---

### Property 12: Menu storage and retrieval round-trip

*For any* authenticated mess owner, any valid mess, any date, and any list of menu items (each with a name and positive price), submitting a PUT menu request and then retrieving the menu for that date should return exactly the same items in the same order.

**Validates: Requirements 5.1, 8.1, 8.3**

---

### Property 13: Invalid menu items are rejected

*For any* menu item where the name is empty/missing or the price is zero or negative, the API should return a validation error and the existing menu should remain unchanged.

**Validates: Requirements 5.2**

---

### Property 14: Menu replacement is atomic

*For any* mess, date, and two distinct menus M1 and M2, if M1 is submitted first and then M2 is submitted for the same date, retrieving the menu for that date should return exactly M2 — no items from M1 should remain.

**Validates: Requirements 5.3**

---

### Property 15: Menu deletion removes the menu

*For any* mess and date with an existing menu, after a DELETE request for that date, a subsequent GET for that date should return an empty menu response.

**Validates: Requirements 5.4**

---

### Property 16: Partial menu item operations preserve other items

*For any* menu with N items, adding, updating, or deleting a single item should leave all other N-1 items unchanged (same names, prices, and order).

**Validates: Requirements 5.5**

---

### Property 17: Nearby search returns only messes within radius

*For any* student GPS location and any configured radius, every mess returned by the nearby search endpoint should have a distance from the student's location that is less than or equal to the radius.

**Validates: Requirements 6.1**

---

### Property 18: Nearby search results are sorted by distance ascending

*For any* nearby search result list with two or more messes, the distance of each mess from the student's location should be less than or equal to the distance of the next mess in the list.

**Validates: Requirements 6.3**

---

### Property 19: Mess details response is complete

*For any* existing mess, the details response should include name, address, latitude, longitude, opening_time, closing_time, price_range, and is_open. When a student GPS location is provided, the response should also include `distance_km`.

**Validates: Requirements 7.1, 7.3**

---

### Property 20: Non-existent mess returns 404

*For any* UUID that does not correspond to an existing mess, a GET request for that mess's details should return a 404 not-found error.

**Validates: Requirements 7.2**

---

### Property 21: Unauthenticated requests are rejected with 401

*For any* protected API endpoint, a request made without a valid session token should return a 401 Unauthorized response.

**Validates: Requirements 9.1**

---

### Property 22: Role-based access control is enforced

*For any* protected endpoint, a request made with a session token whose role does not have permission for that endpoint should return a 403 Forbidden response. Specifically: students cannot write to mess/menu endpoints, and mess owners cannot access student-only endpoints (e.g., nearby search).

**Validates: Requirements 9.2, 9.3, 9.4**

---

### Property 23: Cascade delete removes all associated records

*For any* mess that has associated menus and menu items, deleting the mess should result in all its menus and all their menu items being removed from the database.

**Validates: Requirements 10.4**

---

### Property 24: Invalid GPS coordinates are rejected

*For any* GPS coordinate pair where latitude is outside [-90, 90] or longitude is outside [-180, 180], the API should return a validation error and no mess record should be created.

**Validates: Requirements 10.5**

---

## Error Handling

### Authentication Errors
- `401 Unauthorized` — missing or invalid JWT on any protected endpoint
- `403 Forbidden` — valid JWT but insufficient role for the requested operation
- Auth errors from Supabase are mapped to generic messages; the raw Supabase error is never forwarded to the client

### Validation Errors
- `400 Bad Request` — missing required fields, invalid GPS coordinates, non-positive prices, short passwords
- Response body: `{ "error": "VALIDATION_ERROR", "field": "<field_name>", "message": "<human-readable>" }`

### Not Found
- `404 Not Found` — mess or menu does not exist
- Response body: `{ "error": "NOT_FOUND", "message": "Mess not found" }`

### Authorization
- `403 Forbidden` — mess owner attempting to modify a mess they don't own
- Response body: `{ "error": "FORBIDDEN", "message": "You do not own this mess" }`

### External Service Failures
- If PostGIS/DB is unavailable: `503 Service Unavailable`
- Maps_Service unavailability (if used): `503 Service Unavailable` with message `"Location-based search is temporarily unavailable"`

### Unhandled Errors
- All unhandled exceptions are caught by a global Express error handler
- `500 Internal Server Error` is returned; the stack trace is logged server-side only, never sent to the client

---

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are required. They are complementary:
- Unit tests catch concrete bugs in specific scenarios and edge cases
- Property-based tests verify universal correctness across a wide range of generated inputs

### Unit Tests

Focus on:
- Specific examples: registering a user, creating a mess, retrieving a menu
- Edge cases: empty menu, no messes in radius, missing fields
- Integration points: middleware chain (authenticate → requireRole → handler)
- Error conditions: FK violations, duplicate email, invalid coordinates

Avoid writing unit tests for every input variation — property tests handle that.

### Property-Based Tests

**Library**: Use `fast-check` (TypeScript/JavaScript) for both the Express API tests and any shared validation logic.

**Configuration**: Each property test must run a minimum of **100 iterations**.

**Tagging**: Each property test must include a comment in the following format:
```
// Feature: mess-finder-app, Property <N>: <property_text>
```

**One test per property**: Each of the 24 correctness properties above must be implemented by exactly one property-based test.

**Generator guidance**:
- Generate random valid emails using `fc.emailAddress()`
- Generate random passwords with `fc.string({ minLength: 8 })`
- Generate random GPS coordinates with `fc.tuple(fc.double({ min: -90, max: 90 }), fc.double({ min: -180, max: 180 }))`
- Generate random mess payloads combining the above
- Generate random menu items with `fc.record({ name: fc.string({ minLength: 1 }), price: fc.double({ min: 0.01, max: 9999 }) })`
- For invalid coordinate tests, use `fc.oneof(fc.double({ min: 91, max: 999 }), fc.double({ min: -999, max: -91 }))` for latitude

**Edge cases to include in generators** (from prework analysis):
- Empty menu responses (no menu set for a date) — covered by Property 15 and example test
- Non-existent mess UUID — covered by Property 20
- Coordinates at boundary values (±90 lat, ±180 lon) — include as edge cases in Property 24 generator

### Test Coverage Targets
- All 24 correctness properties implemented as property-based tests
- All error conditions covered by at least one unit/example test
- FK constraint enforcement covered by example tests (Requirements 10.1–10.3)
- Token expiry covered by one example test (Requirement 1.6)
- Empty nearby search result covered by one example test (Requirement 6.4)
- Empty menu response covered by one example test (Requirement 8.2)
