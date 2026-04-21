-- ============================================================
-- get_nearby_messes — PostGIS proximity search function
-- Returns open messes within radius_km of the given coordinates.
-- ============================================================
CREATE OR REPLACE FUNCTION get_nearby_messes(
  student_lat  DOUBLE PRECISION,
  student_lng  DOUBLE PRECISION,
  radius_km    DOUBLE PRECISION DEFAULT 2
)
RETURNS SETOF messes
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM messes
  WHERE is_open = TRUE
    AND ST_DWithin(
      location,
      ST_MakePoint(student_lng, student_lat)::geography,
      radius_km * 1000  -- ST_DWithin uses metres
    )
  ORDER BY location <-> ST_MakePoint(student_lng, student_lat)::geography;
$$;
