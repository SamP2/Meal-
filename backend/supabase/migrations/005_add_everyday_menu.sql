-- Create everyday_menu_items table for permanent menu items
CREATE TABLE IF NOT EXISTS everyday_menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mess_id UUID NOT NULL REFERENCES messes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_everyday_menu_items_mess_id ON everyday_menu_items(mess_id);

-- Disable RLS for now since we're using service role with backend auth
ALTER TABLE everyday_menu_items DISABLE ROW LEVEL SECURITY;
