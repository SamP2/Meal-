import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { supabase } from '../lib/supabase';
import { CreateMessBody } from '../types';

const router = Router();

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// POST /messes — mess_owner only (protected)
router.post('/', authenticate, requireRole('mess_owner'), async (req: Request, res: Response): Promise<void> => {
  const body = req.body as Partial<CreateMessBody>;
  const requiredFields: (keyof CreateMessBody)[] = ['name', 'address', 'latitude', 'longitude', 'opening_time', 'closing_time'];

  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      res.status(400).json({ error: 'VALIDATION_ERROR', field, message: `Missing required field: ${field}` });
      return;
    }
  }

  const { name, address, latitude, longitude, opening_time, closing_time, price_range, fssai_number } = body as CreateMessBody;

  if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
    res.status(400).json({ error: 'VALIDATION_ERROR', field: 'latitude', message: 'latitude must be between -90 and 90' });
    return;
  }
  if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
    res.status(400).json({ error: 'VALIDATION_ERROR', field: 'longitude', message: 'longitude must be between -180 and 180' });
    return;
  }

  const { data, error } = await supabase
    .from('messes')
    .insert({ 
      owner_id: req.user!.id, 
      name, 
      address, 
      latitude, 
      longitude, 
      opening_time, 
      closing_time, 
      price_range: price_range ?? null, 
      is_open: true,
      verified: false,
      verification_status: 'pending',
      fssai_number: fssai_number ?? null,
    })
    .select()
    .single();

  if (error) { res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message }); return; }
  res.status(201).json(data);
});

// GET /messes/nearby — PUBLIC (no auth)
router.get('/nearby', async (req: Request, res: Response): Promise<void> => {
  const { lat, lng, radius } = req.query as { lat?: string; lng?: string; radius?: string };

  console.log('🔍 Nearby messes request:', { lat, lng, radius });

  if (!lat || !lng) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'lat and lng query parameters are required' });
    return;
  }

  const studentLat = parseFloat(lat);
  const studentLng = parseFloat(lng);
  const radiusKm = radius ? parseFloat(radius) : 5;

  if (isNaN(studentLat) || isNaN(studentLng) || isNaN(radiusKm)) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'lat, lng, and radius must be valid numbers' });
    return;
  }

  console.log('📍 Parsed coordinates:', { studentLat, studentLng, radiusKm });

  // TEMPORARILY FETCH ALL MESSES FOR DEBUGGING
  const { data: allMesses, error: allError } = await supabase
    .from('messes')
    .select('*');
  
  console.log('📊 Total messes in DB:', allMesses?.length || 0);
  if (allMesses && allMesses.length > 0) {
    console.log('🍽️ Sample mess:', allMesses[0]);
    console.log('🔓 Open messes:', allMesses.filter(m => m.is_open).length);
  }

  const { data, error } = await supabase.rpc('get_nearby_messes', {
    student_lat: studentLat,
    student_lng: studentLng,
    radius_km: radiusKm,
  });

  console.log('🔍 PostGIS function result:', { dataCount: data?.length || 0, error: error?.message });

  if (error) {
    console.error('❌ PostGIS error:', error);
    res.status(503).json({ error: 'SERVICE_UNAVAILABLE', message: 'Location-based search is temporarily unavailable' });
    return;
  }

  if (!data || data.length === 0) {
    console.log('⚠️ No messes found by PostGIS function');
    res.json({ messes: [], message: 'No messes found nearby' });
    return;
  }

  // Remove duplicates by ID and calculate distance
  const uniqueMesses = new Map();
  (data as Array<Record<string, unknown>>).forEach((mess) => {
    if (!uniqueMesses.has(mess.id)) {
      uniqueMesses.set(mess.id, {
        ...mess,
        distance_km: parseFloat(haversineKm(studentLat, studentLng, mess.latitude as number, mess.longitude as number).toFixed(1)),
      });
    }
  });

  const withDistance = Array.from(uniqueMesses.values())
    .sort((a, b) => a.distance_km - b.distance_km);

  console.log('✅ Returning messes:', withDistance.length);
  res.json({ messes: withDistance });
});

// GET /messes/nearby-with-menus — PUBLIC (no auth) - Optimized with menus
router.get('/nearby-with-menus', async (req: Request, res: Response): Promise<void> => {
  const { lat, lng, radius } = req.query as { lat?: string; lng?: string; radius?: string };

  if (!lat || !lng) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'lat and lng query parameters are required' });
    return;
  }

  const studentLat = parseFloat(lat);
  const studentLng = parseFloat(lng);
  const radiusKm = radius ? parseFloat(radius) : 5;

  if (isNaN(studentLat) || isNaN(studentLng) || isNaN(radiusKm)) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'lat, lng, and radius must be valid numbers' });
    return;
  }

  try {
    // Get nearby messes
    const { data, error } = await supabase.rpc('get_nearby_messes', {
      student_lat: studentLat,
      student_lng: studentLng,
      radius_km: radiusKm,
    });

    if (error || !data || data.length === 0) {
      res.json([]);
      return;
    }

    // Remove duplicates and calculate distance
    const uniqueMesses = new Map();
    (data as Array<Record<string, unknown>>).forEach((mess) => {
      if (!uniqueMesses.has(mess.id)) {
        uniqueMesses.set(mess.id, {
          ...mess,
          distance_km: parseFloat(haversineKm(studentLat, studentLng, mess.latitude as number, mess.longitude as number).toFixed(1)),
        });
      }
    });

    const messes = Array.from(uniqueMesses.values());
    const today = new Date().toISOString().split('T')[0];

    // Get menus for these messes
    const messIds = messes.map((m: any) => m.id);
    const { data: menus } = await supabase
      .from('menus')
      .select('id, mess_id, meal_type')
      .in('mess_id', messIds)
      .eq('date', today);

    // Get menu items
    let menuItemsMap = new Map();
    if (menus && menus.length > 0) {
      const menuIds = menus.map(m => m.id);
      const { data: menuItems } = await supabase
        .from('menu_items')
        .select('menu_id, name, price')
        .in('menu_id', menuIds)
        .order('sort_order');

      if (menuItems) {
        menuItems.forEach(item => {
          if (!menuItemsMap.has(item.menu_id)) {
            menuItemsMap.set(item.menu_id, []);
          }
          menuItemsMap.get(item.menu_id).push(item);
        });
      }
    }

    // Combine data
    const result = messes.map((mess: any) => {
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

      console.log(`📸 Mess ${mess.name}: cover_image_url = ${mess.cover_image_url || 'null'}`);

      return {
        id: mess.id,
        name: mess.name,
        address: mess.address,
        distance_km: mess.distance_km,
        is_open: mess.is_open,
        verified: mess.verified || false,
        price_range: mess.price_range,
        rating: mess.rating || 4.5,
        is_veg: mess.is_veg,
        cuisine: mess.cuisine,
        opening_time: mess.opening_time,
        closing_time: mess.closing_time,
        latitude: mess.latitude,
        longitude: mess.longitude,
        cover_image_url: mess.cover_image_url || null,
        lunch,
        dinner,
      };
    });

    // Sort by distance
    result.sort((a, b) => a.distance_km - b.distance_km);

    res.json(result);
  } catch (error) {
    console.error('Error fetching nearby messes with menus:', error);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to fetch nearby messes' });
  }
});

// GET /messes/mine — mess_owner only (protected)
router.get('/mine', authenticate, requireRole('mess_owner'), async (req: Request, res: Response): Promise<void> => {
  const { data, error } = await supabase.from('messes').select('*').eq('owner_id', req.user!.id);
  if (error) { res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message }); return; }
  res.json(data);
});

// GET /messes/mine-with-menus — Optimized endpoint (imported from menus router)
// This is handled by the menus router at /menus/mine-with-menus

// PATCH /messes/:id/status — mess_owner only (protected)
router.patch('/:id/status', authenticate, requireRole('mess_owner'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { is_open } = req.body as { is_open: boolean };

  const { data: mess, error: fetchError } = await supabase.from('messes').select('*').eq('id', id).single();
  if (fetchError || !mess) { res.status(404).json({ error: 'NOT_FOUND', message: 'Mess not found' }); return; }
  if (mess.owner_id !== req.user!.id) { res.status(403).json({ error: 'FORBIDDEN', message: 'You do not own this mess' }); return; }

  const { data: updated, error: updateError } = await supabase.from('messes').update({ is_open }).eq('id', id).select().single();
  if (updateError) { res.status(500).json({ error: 'INTERNAL_ERROR', message: updateError.message }); return; }
  res.json(updated);
});

// PATCH /messes/:id/cover-image — mess_owner only (protected)
router.patch('/:id/cover-image', authenticate, requireRole('mess_owner'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { cover_image_url } = req.body as { cover_image_url: string };

  // Validation
  if (!cover_image_url || typeof cover_image_url !== 'string') {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'cover_image_url is required' });
    return;
  }

  // Check ownership
  const { data: mess, error: fetchError } = await supabase.from('messes').select('*').eq('id', id).single();
  if (fetchError || !mess) { res.status(404).json({ error: 'NOT_FOUND', message: 'Mess not found' }); return; }
  if (mess.owner_id !== req.user!.id) { res.status(403).json({ error: 'FORBIDDEN', message: 'You do not own this mess' }); return; }

  // Update cover image
  const { data: updated, error: updateError } = await supabase
    .from('messes')
    .update({ cover_image_url })
    .eq('id', id)
    .select()
    .single();

  if (updateError) { res.status(500).json({ error: 'INTERNAL_ERROR', message: updateError.message }); return; }
  res.json(updated);
});

// GET /messes/:id — PUBLIC (no auth)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { data: mess, error } = await supabase.from('messes').select('*').eq('id', id).single();
  if (error || !mess) { res.status(404).json({ error: 'NOT_FOUND', message: 'Mess not found' }); return; }

  const { lat, lng } = req.query as { lat?: string; lng?: string };
  if (lat && lng) {
    const sLat = parseFloat(lat);
    const sLng = parseFloat(lng);
    if (!isNaN(sLat) && !isNaN(sLng)) {
      mess.distance_km = haversineKm(sLat, sLng, mess.latitude, mess.longitude);
    }
  }

  res.json(mess);
});

// DELETE /messes/:id — mess_owner only (protected)
router.delete('/:id', authenticate, requireRole('mess_owner'), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Verify ownership
  const { data: mess, error: fetchError } = await supabase
    .from('messes')
    .select('id, owner_id, name')
    .eq('id', id)
    .single();

  if (fetchError || !mess) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Mess not found' });
    return;
  }

  if (mess.owner_id !== req.user!.id) {
    res.status(403).json({ error: 'FORBIDDEN', message: 'You do not own this mess' });
    return;
  }

  const { error: deleteError } = await supabase
    .from('messes')
    .delete()
    .eq('id', id);

  if (deleteError) {
    res.status(500).json({ error: 'INTERNAL_ERROR', message: deleteError.message });
    return;
  }

  res.json({ message: `Mess "${mess.name}" deleted successfully` });
});

export default router;
