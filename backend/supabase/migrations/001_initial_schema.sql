-- ============================================================
-- Mess Finder — Initial Schema
-- Run this migration in your Supabase SQL editor or via CLI.
-- ============================================================

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

-- Generated geography column for efficient spatial queries
ALTER TABLE messes ADD COLUMN location GEOGRAPHY(POINT, 4326)
  GENERATED ALWAYS AS (ST_MakePoint(longitude, latitude)) STORED;

-- Spatial index for ST_DWithin proximity queries
CREATE INDEX messes_location_idx ON messes USING GIST (location);

-- Menus (one per mess per date)
CREATE TABLE menus (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mess_id    UUID NOT NULL REFERENCES messes(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
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
