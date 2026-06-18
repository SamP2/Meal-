import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /messes/:messId/everyday-menu — Get all everyday menu items for a mess
router.get('/:messId/everyday-menu', async (req: Request, res: Response): Promise<void> => {
  const { messId } = req.params;

  try {
    // Verify mess exists
    const { data: mess, error: messError } = await supabase
      .from('messes')
      .select('id')
      .eq('id', messId)
      .single();

    if (messError || !mess) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Mess not found' });
      return;
    }

    // Get all everyday menu items
    const { data: items, error: itemsError } = await supabase
      .from('everyday_menu_items')
      .select('*')
      .eq('mess_id', messId)
      .order('created_at', { ascending: true });

    if (itemsError) {
      console.error('Failed to fetch everyday menu items:', itemsError);
      res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to fetch everyday menu items' });
      return;
    }

    res.json(items || []);
  } catch (error) {
    console.error('Everyday menu fetch error:', error);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to fetch everyday menu' });
  }
});

// POST /messes/:messId/everyday-menu — Add item to everyday menu
router.post('/:messId/everyday-menu', authenticate, requireRole('mess_owner'), async (req: Request, res: Response): Promise<void> => {
  const { messId } = req.params;
  const { name, price } = req.body;

  // Validation
  if (!name || !price) {
    res.status(400).json({ 
      error: 'VALIDATION_ERROR', 
      message: 'name and price are required' 
    });
    return;
  }

  if (typeof price !== 'number' || price <= 0) {
    res.status(400).json({ 
      error: 'VALIDATION_ERROR', 
      message: 'price must be a positive number' 
    });
    return;
  }

  // Verify mess ownership (using service role client)
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

  try {
    // Insert new everyday menu item (RLS will be bypassed with service role)
    const { data: newItem, error: insertError } = await supabase
      .from('everyday_menu_items')
      .insert({
        mess_id: messId,
        name: name.trim(),
        price: typeof price === 'number' ? price : parseFloat(price),
      })
      .select()
      .single();

    if (insertError || !newItem) {
      console.error('Failed to create everyday menu item:', insertError);
      res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to create everyday menu item' });
      return;
    }

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Everyday menu creation error:', error);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to create everyday menu item' });
  }
});

// DELETE /everyday-menu/:itemId — Delete an everyday menu item
router.delete('/:itemId', authenticate, requireRole('mess_owner'), async (req: Request, res: Response): Promise<void> => {
  const { itemId } = req.params;

  try {
    // Get the item to verify ownership
    const { data: item, error: itemError } = await supabase
      .from('everyday_menu_items')
      .select('mess_id')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Everyday menu item not found' });
      return;
    }

    // Verify mess ownership
    const { data: mess, error: messError } = await supabase
      .from('messes')
      .select('owner_id')
      .eq('id', item.mess_id)
      .single();

    if (messError || !mess) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Mess not found' });
      return;
    }

    if (mess.owner_id !== req.user!.id) {
      res.status(403).json({ error: 'FORBIDDEN', message: 'You do not own this mess' });
      return;
    }

    // Delete the item
    const { error: deleteError } = await supabase
      .from('everyday_menu_items')
      .delete()
      .eq('id', itemId);

    if (deleteError) {
      console.error('Failed to delete everyday menu item:', deleteError);
      res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to delete everyday menu item' });
      return;
    }

    res.json({ 
      message: 'Everyday menu item deleted successfully',
      deleted: true,
    });
  } catch (error) {
    console.error('Everyday menu deletion error:', error);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to delete everyday menu item' });
  }
});

export default router;
