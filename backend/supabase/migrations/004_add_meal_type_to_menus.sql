-- Add meal_type column to menus table
ALTER TABLE menus ADD COLUMN meal_type TEXT;

-- Update existing menus to have a default meal_type
UPDATE menus SET meal_type = 'lunch' WHERE meal_type IS NULL;

-- Make meal_type NOT NULL
ALTER TABLE menus ALTER COLUMN meal_type SET NOT NULL;

-- Drop old unique constraint
ALTER TABLE menus DROP CONSTRAINT IF EXISTS menus_mess_id_date_key;

-- Add new unique constraint with meal_type
ALTER TABLE menus ADD CONSTRAINT menus_mess_id_date_meal_type_key UNIQUE (mess_id, date, meal_type);

-- Add check constraint for meal_type
ALTER TABLE menus ADD CONSTRAINT menus_meal_type_check CHECK (meal_type IN ('lunch', 'dinner'));
