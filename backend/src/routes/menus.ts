import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /messes/mine-with-menus — Optimized endpoint with menus included
router.get('/mine-with-menus', authenticate, requireRole('mess_owner'), async (req: Request, res: Response): Promise<void> => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    // Get all messes owned by user
    const { data: messes, error: messError } = await supabase
      .from('messes')
      .select('*')
      .eq('owner_id', req.user!.id);

    if (messError) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: messError.message });
      return;
    }

    if (!messes || messes.length === 0) {
      res.json([]);
      return;
    }

    // Get all menus for today for these messes
    const messIds = messes.map(m => m.id);
    const { data: menus, error: menuError } = await supabase
      .from('menus')
      .select('id, mess_id, meal_type')
      .in('mess_id', messIds)
      .eq('date', today);

    if (menuError) {
      console.error('Menu fetch error:', menuError);
      // Continue without menus
    }

    // Get all menu items for these menus
    let menuItemsMap = new Map();
    if (menus && menus.length > 0) {
      const menuIds = menus.map(m => m.id);
      const { data: menuItems } = await supabase
        .from('menu_items')
        .select('menu_id, name, price')
        .in('menu_id', menuIds)
        .order('sort_order');

      if (menuItems) {
        // Group items by menu_id
        menuItems.forEach(item => {
          if (!menuItemsMap.has(item.menu_id)) {
            menuItemsMap.set(item.menu_id, []);
          }
          menuItemsMap.get(item.menu_id).push(item);
        });
      }
    }

    // Combine data
    const result = messes.map(mess => {
      const lunchMenu = menus?.find(m => m.mess_id === mess.id && m.meal_type === 'lunch');
      const dinnerMenu = menus?.find(m => m.mess_id === mess.id && m.meal_type === 'dinner');

      let lunch = null;
      let dinner = null;

      if (lunchMenu) {
        const items = menuItemsMap.get(lunchMenu.id) || [];
        if (items.length > 0) {
          lunch = {
            items: items.map((item: any) => item.name),
            price: items[0].price,
          };
        }
      }

      if (dinnerMenu) {
        const items = menuItemsMap.get(dinnerMenu.id) || [];
        if (items.length > 0) {
          dinner = {
            items: items.map((item: any) => item.name),
            price: items[0].price,
          };
        }
      }

      return {
        id: mess.id,
        name: mess.name,
        address: mess.address,
        is_open: mess.is_open,
        verified: mess.verified || false,
        verification_status: mess.verification_status || 'pending',
        cover_image_url: mess.cover_image_url || null,
        lunch,
        dinner,
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching messes with menus:', error);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to fetch messes' });
  }
});

// GET /menus/:messId/today — Get today's menu for a mess
router.get('/:messId/today', authenticate, requireRole('mess_owner'), async (req: Request, res: Response): Promise<void> => {
  const { messId } = req.params;
  const { meal_type } = req.query;

  // Verify mess ownership
  const { data: mess, error: messError } = await supabase
    .from('messes')
    .select('*')
    .eq('id', messId)
    .single();

  if (messError || !mess) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Mess not found' });
    return;
  }

  if (mess.owner_id !== req.user!.id) {
    res.status(403).json({ error: 'FORBIDDEN', message: 'You do not own this mess' });
    return;
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    // Get today's menu for specific meal_type
    const { data: menu } = await supabase
      .from('menus')
      .select('id')
      .eq('mess_id', messId)
      .eq('date', today)
      .eq('meal_type', meal_type || 'lunch')
      .single();

    if (!menu) {
      res.json({ exists: false, menu: null });
      return;
    }

    // Get menu items
    const { data: menuItems, error: itemsError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('menu_id', menu.id)
      .order('sort_order');

    if (itemsError) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to fetch menu items' });
      return;
    }

    if (!menuItems || menuItems.length === 0) {
      res.json({ exists: false, menu: null });
      return;
    }

    // Extract items and price
    const items = menuItems.map(item => item.name);

    const price = menuItems[0]?.price || 0;

    res.json({
      exists: true,
      menu: {
        menu_id: menu.id,
        items, // Now returns array
        price,
        meal_type: meal_type || 'lunch',
        date: today,
      },
    });
  } catch (error) {
    console.error('Menu fetch error:', error);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to fetch menu' });
  }
});

// POST /menus — Create or update menu for today
router.post('/', authenticate, requireRole('mess_owner'), async (req: Request, res: Response): Promise<void> => {
  const { mess_id, meal_type, items, price } = req.body;

  // Validation
  if (!mess_id || !meal_type || !items || !price) {
    res.status(400).json({ 
      error: 'VALIDATION_ERROR', 
      message: 'mess_id, meal_type, items, and price are required' 
    });
    return;
  }

  if (!['lunch', 'dinner'].includes(meal_type)) {
    res.status(400).json({ 
      error: 'VALIDATION_ERROR', 
      message: 'meal_type must be either "lunch" or "dinner"' 
    });
    return;
  }

  // Verify mess ownership
  const { data: mess, error: messError } = await supabase
    .from('messes')
    .select('*')
    .eq('id', mess_id)
    .single();

  if (messError || !mess) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Mess not found' });
    return;
  }

  if (mess.owner_id !== req.user!.id) {
    res.status(403).json({ error: 'FORBIDDEN', message: 'You do not own this mess' });
    return;
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    // Check if menu exists for today + meal_type
    const { data: existingMenu } = await supabase
      .from('menus')
      .select('id')
      .eq('mess_id', mess_id)
      .eq('date', today)
      .eq('meal_type', meal_type)
      .single();

    let menuId: string;

    if (existingMenu) {
      // Update existing menu - delete old items
      menuId = existingMenu.id;
      
      await supabase
        .from('menu_items')
        .delete()
        .eq('menu_id', menuId);
    } else {
      // Create new menu with meal_type
      const { data: newMenu, error: menuError } = await supabase
        .from('menus')
        .insert({ mess_id, date: today, meal_type })
        .select()
        .single();

      if (menuError || !newMenu) {
        console.error('Menu creation error:', menuError);
        res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to create menu' });
        return;
      }

      menuId = newMenu.id;
    }

    // Parse items - accept both array and string formats
    let itemsList: string[];
    if (Array.isArray(items)) {
      itemsList = items.filter((item: string) => item && item.trim());
    } else if (typeof items === 'string') {
      itemsList = items.split(',').map((item: string) => item.trim()).filter((item: string) => item);
    } else {
      res.status(400).json({ error: 'VALIDATION_ERROR', message: 'items must be an array or comma-separated string' });
      return;
    }

    if (itemsList.length === 0) {
      res.status(400).json({ error: 'VALIDATION_ERROR', message: 'At least one menu item is required' });
      return;
    }
    
    const menuItems = itemsList.map((itemName: string, index: number) => ({
      menu_id: menuId,
      name: itemName, // store clean name — meal_type is on the parent menus row
      price: parseFloat(price),
      sort_order: index,
    }));

    const { error: itemsError } = await supabase
      .from('menu_items')
      .insert(menuItems);

    if (itemsError) {
      console.error('Menu items creation error:', itemsError);
      res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to create menu items' });
      return;
    }

    res.status(201).json({ 
      message: 'Menu updated successfully',
      menu_id: menuId,
      date: today,
      meal_type,
      items: itemsList,
      price,
    });
  } catch (error) {
    console.error('Menu creation error:', error);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to update menu' });
  }
});

// DELETE /menus/:messId/today — Delete today's menu for a specific meal type
router.delete('/:messId/today', authenticate, requireRole('mess_owner'), async (req: Request, res: Response): Promise<void> => {
  const { messId } = req.params;
  const meal_type = req.query.meal_type as string;

  // Validation
  if (!meal_type || !['lunch', 'dinner'].includes(meal_type)) {
    res.status(400).json({ 
      error: 'VALIDATION_ERROR', 
      message: 'meal_type query parameter is required and must be "lunch" or "dinner"' 
    });
    return;
  }

  // Verify mess ownership
  const { data: mess, error: messError } = await supabase
    .from('messes')
    .select('*')
    .eq('id', messId)
    .single();

  if (messError || !mess) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Mess not found' });
    return;
  }

  if (mess.owner_id !== req.user!.id) {
    res.status(403).json({ error: 'FORBIDDEN', message: 'You do not own this mess' });
    return;
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    // Find today's menu for the specific meal type
    const { data: menu } = await supabase
      .from('menus')
      .select('id')
      .eq('mess_id', messId)
      .eq('date', today)
      .eq('meal_type', meal_type)
      .single();

    if (!menu) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Menu not found for today' });
      return;
    }

    // Delete menu items first (foreign key constraint)
    const { error: itemsError } = await supabase
      .from('menu_items')
      .delete()
      .eq('menu_id', menu.id);

    if (itemsError) {
      console.error('Failed to delete menu items:', itemsError);
      res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to delete menu items' });
      return;
    }

    // Delete the menu
    const { error: menuError } = await supabase
      .from('menus')
      .delete()
      .eq('id', menu.id);

    if (menuError) {
      console.error('Failed to delete menu:', menuError);
      res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to delete menu' });
      return;
    }

    const mealTypeCapitalized = meal_type.charAt(0).toUpperCase() + meal_type.slice(1);
    res.json({ 
      message: `${mealTypeCapitalized} menu deleted successfully`,
      deleted: true,
      meal_type,
      date: today,
    });
  } catch (error) {
    console.error('Menu deletion error:', error);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to delete menu' });
  }
});

export default router;
