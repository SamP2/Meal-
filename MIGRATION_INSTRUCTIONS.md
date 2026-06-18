# Database Migration Required

## Migration: Add meal_type to menus table

To support separate Lunch and Dinner menus, you need to run the migration in Supabase.

### Steps:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the migration**
   - Copy the contents of `backend/supabase/migrations/004_add_meal_type_to_menus.sql`
   - Paste into the SQL editor
   - Click "Run"

4. **Verify**
   - The migration will:
     - Add `meal_type` column to `menus` table
     - Set existing menus to 'lunch'
     - Create unique constraint on (mess_id, date, meal_type)
     - Add check constraint for meal_type values

### Migration SQL:

```sql
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
```

### After Migration:

The app will now support:
- ✅ Separate Lunch and Dinner menus for each mess
- ✅ Each mess can have both lunch and dinner on the same day
- ✅ Updating lunch won't overwrite dinner (and vice versa)
- ✅ Dashboard shows both menus separately
