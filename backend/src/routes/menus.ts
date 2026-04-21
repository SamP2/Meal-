import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { supabase } from '../lib/supabase';
import { MenuItemInput } from '../types';

const router = Router({ mergeParams: true });

// GET /messes/:messId/menu — student only
router.get(
  '/',
  authenticate,
  requireRole('student'),
  async (req: Request, res: Response): Promise<void> => {
    const { messId } = req.params;
    const { date } = req.query as { date?: string };

    if (!date) {
      res.status(400).json({ error: 'VALIDATION_ERROR', message: 'date query param is required (YYYY-MM-DD)' });
      return;
    }

    const { data: menu, error } = await supabase
      .from('menus')
      .select('*, items:menu_items(id, name, price, sort_order, created_at)')
      .eq('mess_id', messId)
      .eq('date', date)
      .order('sort_order', { referencedTable: 'menu_items', ascending: true })
      .maybeSingle();

    if (error) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
      return;
    }

    if (!menu) {
      res.json({ date, items: [], message: 'No menu available for this day' });
      return;
    }

    res.json({ date: menu.date, items: menu.items ?? [] });
  }
);

// PUT /messes/:messId/menu/:date — mess_owner only (replace full menu atomically)
router.put(
  '/:date',
  authenticate,
  requireRole('mess_owner'),
  async (req: Request, res: Response): Promise<void> => {
    const { messId, date } = req.params;
    const { items } = req.body as { items: MenuItemInput[] };

    if (!Array.isArray(items)) {
      res.status(400).json({ error: 'VALIDATION_ERROR', message: 'items must be an array' });
      return;
    }

    // Validate each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
        res.status(400).json({ error: 'VALIDATION_ERROR', field: `items[${i}].name`, message: 'Item name is required' });
        return;
      }
      if (typeof item.price !== 'number' || item.price <= 0) {
        res.status(400).json({ error: 'VALIDATION_ERROR', field: `items[${i}].price`, message: 'Item price must be a positive number' });
        return;
      }
    }

    // Verify ownership
    const { data: mess, error: messError } = await supabase
      .from('messes')
      .select('owner_id')
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

    // Upsert menu row
    const { data: menu, error: menuError } = await supabase
      .from('menus')
      .upsert({ mess_id: messId, date }, { onConflict: 'mess_id,date' })
      .select()
      .single();

    if (menuError || !menu) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: menuError?.message ?? 'Failed to upsert menu' });
      return;
    }

    // Delete existing items then insert new ones (atomic replacement)
    const { error: deleteError } = await supabase
      .from('menu_items')
      .delete()
      .eq('menu_id', menu.id);

    if (deleteError) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: deleteError.message });
      return;
    }

    if (items.length > 0) {
      const rows = items.map((item, idx) => ({
        menu_id: menu.id,
        name: item.name.trim(),
        price: item.price,
        sort_order: idx,
      }));

      const { error: insertError } = await supabase.from('menu_items').insert(rows);
      if (insertError) {
        res.status(500).json({ error: 'INTERNAL_ERROR', message: insertError.message });
        return;
      }
    }

    // Return stored menu
    const { data: stored } = await supabase
      .from('menu_items')
      .select('id, name, price, sort_order')
      .eq('menu_id', menu.id)
      .order('sort_order', { ascending: true });

    res.json({ date, items: stored ?? [] });
  }
);

// DELETE /messes/:messId/menu/:date — mess_owner only
router.delete(
  '/:date',
  authenticate,
  requireRole('mess_owner'),
  async (req: Request, res: Response): Promise<void> => {
    const { messId, date } = req.params;

    // Verify ownership
    const { data: mess, error: messError } = await supabase
      .from('messes')
      .select('owner_id')
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

    const { data: menu, error: menuError } = await supabase
      .from('menus')
      .select('id')
      .eq('mess_id', messId)
      .eq('date', date)
      .maybeSingle();

    if (menuError || !menu) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'No menu found for this date' });
      return;
    }

    const { error: deleteError } = await supabase.from('menus').delete().eq('id', menu.id);
    if (deleteError) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: deleteError.message });
      return;
    }

    res.status(204).send();
  }
);

// POST /messes/:messId/menu/:date/items — add single item
router.post(
  '/:date/items',
  authenticate,
  requireRole('mess_owner'),
  async (req: Request, res: Response): Promise<void> => {
    const { messId, date } = req.params;
    const { name, price } = req.body as MenuItemInput;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      res.status(400).json({ error: 'VALIDATION_ERROR', field: 'name', message: 'Item name is required' });
      return;
    }
    if (typeof price !== 'number' || price <= 0) {
      res.status(400).json({ error: 'VALIDATION_ERROR', field: 'price', message: 'Item price must be a positive number' });
      return;
    }

    // Verify ownership
    const { data: mess } = await supabase.from('messes').select('owner_id').eq('id', messId).single();
    if (!mess || mess.owner_id !== req.user!.id) {
      res.status(403).json({ error: 'FORBIDDEN', message: 'You do not own this mess' });
      return;
    }

    const { data: menu, error: menuError } = await supabase
      .from('menus')
      .select('id')
      .eq('mess_id', messId)
      .eq('date', date)
      .maybeSingle();

    if (menuError || !menu) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'No menu found for this date' });
      return;
    }

    // Get current max sort_order
    const { data: lastItem } = await supabase
      .from('menu_items')
      .select('sort_order')
      .eq('menu_id', menu.id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const sort_order = lastItem ? (lastItem.sort_order as number) + 1 : 0;

    const { data: item, error: insertError } = await supabase
      .from('menu_items')
      .insert({ menu_id: menu.id, name: name.trim(), price, sort_order })
      .select()
      .single();

    if (insertError) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: insertError.message });
      return;
    }

    res.status(201).json(item);
  }
);

// PATCH /messes/:messId/menu/:date/items/:itemId — update single item
router.patch(
  '/:date/items/:itemId',
  authenticate,
  requireRole('mess_owner'),
  async (req: Request, res: Response): Promise<void> => {
    const { messId, itemId } = req.params;
    const { name, price } = req.body as Partial<MenuItemInput>;

    // Verify ownership
    const { data: mess } = await supabase.from('messes').select('owner_id').eq('id', messId).single();
    if (!mess || mess.owner_id !== req.user!.id) {
      res.status(403).json({ error: 'FORBIDDEN', message: 'You do not own this mess' });
      return;
    }

    const updates: Partial<{ name: string; price: number }> = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        res.status(400).json({ error: 'VALIDATION_ERROR', field: 'name', message: 'Item name cannot be empty' });
        return;
      }
      updates.name = name.trim();
    }
    if (price !== undefined) {
      if (typeof price !== 'number' || price <= 0) {
        res.status(400).json({ error: 'VALIDATION_ERROR', field: 'price', message: 'Item price must be a positive number' });
        return;
      }
      updates.price = price;
    }

    const { data: item, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error || !item) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Menu item not found' });
      return;
    }

    res.json(item);
  }
);

// DELETE /messes/:messId/menu/:date/items/:itemId — remove single item
router.delete(
  '/:date/items/:itemId',
  authenticate,
  requireRole('mess_owner'),
  async (req: Request, res: Response): Promise<void> => {
    const { messId, itemId } = req.params;

    // Verify ownership
    const { data: mess } = await supabase.from('messes').select('owner_id').eq('id', messId).single();
    if (!mess || mess.owner_id !== req.user!.id) {
      res.status(403).json({ error: 'FORBIDDEN', message: 'You do not own this mess' });
      return;
    }

    const { error } = await supabase.from('menu_items').delete().eq('id', itemId);
    if (error) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
      return;
    }

    res.status(204).send();
  }
);

export default router;
