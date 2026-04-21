# Requirements Document

## Introduction

Mess Finder is a two-sided mobile platform (Android and iOS) that connects university/college students with nearby messes (local canteens and food stalls). Students can discover messes near their campus using GPS, browse daily menus, and view mess details to make informed meal decisions. Mess owners can register their establishment, manage daily menus, and control their open/close status in real time.

The V1 scope excludes payments and subscriptions. The tech stack is React Native (Expo) for mobile, Node.js + Express for the backend API, PostgreSQL hosted on Supabase for the database, Supabase Auth for authentication, and Google Maps API for location-based discovery.

---

## Glossary

- **Student**: A university or college student who uses the app to discover and evaluate nearby messes.
- **Mess_Owner**: A person who owns or manages a mess and uses the app to register and manage their listing.
- **Mess**: A local canteen, food stall, or small eatery near a university campus.
- **Menu**: The list of food items available at a Mess for a given day, including item names and prices.
- **Menu_Item**: A single food item within a Menu, with a name and price.
- **GPS_Location**: The geographic coordinates (latitude and longitude) obtained from the device.
- **Auth_Service**: The Supabase-based authentication service responsible for user identity management.
- **API_Server**: The Node.js + Express backend that handles business logic and data access.
- **Database**: The PostgreSQL database hosted on Supabase.
- **Maps_Service**: The Google Maps API integration used for proximity-based mess discovery.
- **Session**: An authenticated user session maintained via a JWT token issued by the Auth_Service.
- **Open_Status**: A boolean flag on a Mess indicating whether it is currently accepting students.

---

## Requirements

### Requirement 1: Student Registration and Login

**User Story:** As a student, I want to create an account and log in, so that I can access personalized features and save my preferences.

#### Acceptance Criteria

1. WHEN a student submits a valid email address and password, THE Auth_Service SHALL create a new student account and return a Session token.
2. WHEN a student submits an email address that is already registered, THE Auth_Service SHALL return an error indicating the email is already in use.
3. WHEN a student submits a password shorter than 8 characters, THE Auth_Service SHALL return a validation error before attempting account creation.
4. WHEN a registered student submits valid credentials, THE Auth_Service SHALL return a valid Session token.
5. WHEN a registered student submits invalid credentials, THE Auth_Service SHALL return an authentication error without revealing which field is incorrect.
6. WHEN a student's Session token expires, THE Auth_Service SHALL require the student to re-authenticate before accessing protected resources.

---

### Requirement 2: Mess Owner Registration and Login

**User Story:** As a mess owner, I want to create an account and log in, so that I can manage my mess listing on the platform.

#### Acceptance Criteria

1. WHEN a mess owner submits a valid email address and password, THE Auth_Service SHALL create a new mess owner account and return a Session token.
2. WHEN a mess owner submits an email address that is already registered, THE Auth_Service SHALL return an error indicating the email is already in use.
3. WHEN a mess owner submits a password shorter than 8 characters, THE Auth_Service SHALL return a validation error before attempting account creation.
4. WHEN a registered mess owner submits valid credentials, THE Auth_Service SHALL return a valid Session token.
5. WHEN a registered mess owner submits invalid credentials, THE Auth_Service SHALL return an authentication error without revealing which field is incorrect.
6. THE Auth_Service SHALL associate each account with exactly one role: either "student" or "mess_owner".

---

### Requirement 3: Mess Registration by Owner

**User Story:** As a mess owner, I want to register my mess on the platform, so that students can discover it.

#### Acceptance Criteria

1. WHEN an authenticated mess owner submits a mess name, address, GPS coordinates, opening time, closing time, and price range, THE API_Server SHALL create a new Mess record in the Database.
2. WHEN a mess owner submits a mess registration without a required field (name, address, GPS coordinates, opening time, or closing time), THE API_Server SHALL return a validation error identifying the missing field.
3. THE API_Server SHALL associate each registered Mess with exactly one Mess_Owner account.
4. WHEN a mess owner attempts to register a second Mess using the same account, THE API_Server SHALL permit the registration and associate both Mess records with that Mess_Owner account.
5. WHEN a Mess is first created, THE API_Server SHALL set its Open_Status to closed by default.

---

### Requirement 4: Mess Open/Close Status Management

**User Story:** As a mess owner, I want to set my mess as open or closed, so that students know whether they can visit right now.

#### Acceptance Criteria

1. WHEN an authenticated Mess_Owner sends a request to update the Open_Status of their Mess, THE API_Server SHALL update the Open_Status in the Database within 2 seconds.
2. WHEN a Mess_Owner attempts to update the Open_Status of a Mess they do not own, THE API_Server SHALL return an authorization error.
3. WHILE a Mess has Open_Status set to open, THE API_Server SHALL include that Mess in nearby search results for Students.
4. WHILE a Mess has Open_Status set to closed, THE API_Server SHALL exclude that Mess from nearby search results by default.

---

### Requirement 5: Daily Menu Management by Mess Owner

**User Story:** As a mess owner, I want to update my daily menu, so that students can see what food is available today.

#### Acceptance Criteria

1. WHEN an authenticated Mess_Owner submits a list of Menu_Items (each with a name and price) for a specific date, THE API_Server SHALL store the Menu in the Database associated with that Mess and date.
2. WHEN a Mess_Owner submits a Menu_Item with a missing name or a non-positive price, THE API_Server SHALL return a validation error identifying the invalid field.
3. WHEN a Mess_Owner submits a new Menu for a date on which a Menu already exists, THE API_Server SHALL replace the existing Menu with the new one.
4. WHEN an authenticated Mess_Owner sends a request to delete a Menu for a specific date, THE API_Server SHALL remove that Menu from the Database.
5. THE API_Server SHALL permit a Mess_Owner to add, update, or remove individual Menu_Items within an existing Menu without replacing the entire Menu.

---

### Requirement 6: GPS-Based Nearby Mess Discovery for Students

**User Story:** As a student, I want to see messes near my current location, so that I can quickly find somewhere to eat without walking too far.

#### Acceptance Criteria

1. WHEN an authenticated Student grants location permission and requests nearby messes, THE API_Server SHALL return a list of Messes within a configurable radius (default 2 km) of the Student's GPS_Location.
2. WHEN the Maps_Service is unavailable, THE API_Server SHALL return an error indicating that location-based search is temporarily unavailable.
3. THE API_Server SHALL sort the returned Mess list by distance from the Student's GPS_Location in ascending order.
4. WHEN no Messes exist within the configured radius, THE API_Server SHALL return an empty list and a message indicating no messes were found nearby.
5. WHEN a Student requests nearby messes without granting location permission, THE App SHALL display a prompt explaining why location access is required.

---

### Requirement 7: Mess Details View for Students

**User Story:** As a student, I want to view the details of a mess, so that I can decide whether it suits my needs before going there.

#### Acceptance Criteria

1. WHEN an authenticated Student requests the details of a specific Mess, THE API_Server SHALL return the Mess name, address, GPS coordinates, opening time, closing time, price range, and current Open_Status.
2. WHEN an authenticated Student requests the details of a Mess that does not exist, THE API_Server SHALL return a not-found error.
3. THE API_Server SHALL include the distance from the Student's last known GPS_Location in the Mess details response when GPS_Location is available.

---

### Requirement 8: Daily Menu View for Students

**User Story:** As a student, I want to browse the daily menu of a mess, so that I can decide whether the food available today meets my preferences.

#### Acceptance Criteria

1. WHEN an authenticated Student requests the Menu for a specific Mess and date, THE API_Server SHALL return all Menu_Items (name and price) for that Mess on that date.
2. WHEN no Menu has been set for the requested Mess and date, THE API_Server SHALL return an empty menu response indicating no menu is available for that day.
3. THE API_Server SHALL return Menu_Items sorted by insertion order as provided by the Mess_Owner.

---

### Requirement 9: Role-Based Access Control

**User Story:** As a platform operator, I want access to be restricted by user role, so that students cannot modify mess data and mess owners cannot access student-only features.

#### Acceptance Criteria

1. WHEN an unauthenticated user attempts to access any protected API endpoint, THE API_Server SHALL return a 401 Unauthorized error.
2. WHEN a Student attempts to create, update, or delete a Mess or Menu, THE API_Server SHALL return a 403 Forbidden error.
3. WHEN a Mess_Owner attempts to access student-specific endpoints (e.g., nearby mess search), THE API_Server SHALL return a 403 Forbidden error.
4. THE API_Server SHALL validate the role claim in the Session token on every protected request.

---

### Requirement 10: Data Consistency and Integrity

**User Story:** As a platform operator, I want the data stored in the system to be consistent and valid, so that students receive accurate information.

#### Acceptance Criteria

1. THE Database SHALL enforce a foreign key constraint between each Mess record and its owning Mess_Owner account.
2. THE Database SHALL enforce a foreign key constraint between each Menu record and its associated Mess record.
3. THE Database SHALL enforce a foreign key constraint between each Menu_Item record and its associated Menu record.
4. WHEN a Mess record is deleted, THE Database SHALL cascade the deletion to all associated Menu and Menu_Item records.
5. THE API_Server SHALL reject any GPS coordinates where the latitude is outside the range [-90, 90] or the longitude is outside the range [-180, 180].
