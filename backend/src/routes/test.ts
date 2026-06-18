import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /test/messes - Check all messes in database
router.get('/messes', async (_req: Request, res: Response): Promise<void> => {
  const { data, error } = await supabase.from('messes').select('*');
  
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({
    count: data?.length || 0,
    messes: data,
  });
});

// POST /test/seed - Add test messes
router.post('/seed', async (_req: Request, res: Response): Promise<void> => {
  try {
    // First, get a mess owner user ID (or create one)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'mess_owner')
      .limit(1);

    if (!profiles || profiles.length === 0) {
      res.status(400).json({ error: 'No mess_owner found. Please register a mess owner first.' });
      return;
    }

    const ownerId = profiles[0].id;

    // Test messes near Pune, India (18.5204, 73.8567)
    const testMesses = [
      {
        owner_id: ownerId,
        name: 'Annapurna Executive Mess',
        address: 'Shivaji Nagar, Pune',
        latitude: 18.5304,
        longitude: 73.8467,
        opening_time: '08:00:00',
        closing_time: '22:00:00',
        price_range: '₹120-150',
        is_open: true,
        cuisine: 'Maharashtrian',
        description: 'Authentic Maharashtrian flavors with unlimited rotis',
        rating: 4.6,
        review_count: 45,
        is_veg: true,
        is_verified: true,
      },
      {
        owner_id: ownerId,
        name: 'Royal Kitchen',
        address: 'Kothrud, Pune',
        latitude: 18.5074,
        longitude: 73.8077,
        opening_time: '07:00:00',
        closing_time: '21:00:00',
        price_range: '₹90-120',
        is_open: true,
        cuisine: 'North Indian',
        description: 'Delicious North Indian meals',
        rating: 4.8,
        review_count: 67,
        is_veg: false,
        is_verified: true,
      },
      {
        owner_id: ownerId,
        name: 'Saraswati Dining',
        address: 'Deccan, Pune',
        latitude: 18.5167,
        longitude: 73.8422,
        opening_time: '08:00:00',
        closing_time: '20:00:00',
        price_range: '₹110-140',
        is_open: false,
        cuisine: 'Pure Veg',
        description: 'Healthy vegetarian meals',
        rating: 4.2,
        review_count: 32,
        is_veg: true,
        is_verified: false,
      },
    ];

    const { data, error } = await supabase
      .from('messes')
      .insert(testMesses)
      .select();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({
      message: 'Test messes created successfully',
      count: data?.length || 0,
      messes: data,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
