import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { supabase } from '../lib/supabase';
import { CreateMessBody } from '../types';

const router = Router();

// Haversine formula — returns distance in km between two GPS points
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

// POST /messes — mess_owner only
router.post(
  '/',
  authenticate,
  requireRole('mess_owner'),
  async (req: Request, res: Response): Promise<void> => {
    const body = req.body as Partial<CreateMessBody>;

    const requiredFields: (keyof CreateMessBody)[] = [
      'name',
      'address',
      'latitude',
      'longitude',
      'opening_time',
      'closing_time',
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        res.status(400).json({
          error: 'VALIDATION_ERROR',
          field,
          message: `Missing required field: ${field}`,
        });
        return;
      }
    }

    const { name, address, latitude, longitude, opening_time, closing_time, price_range } =
      body as CreateMessBody;

    if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        field: 'latitude',
        message: 'latitude must be a number between -90 and 90',
      });
      return;
    }

    if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        field: 'longitude',
        message: 'longitude must be a number between -180 and 180',
      });
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
        is_open: false,
      })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
      return;
    }

    res.status(201).json(data);
  }
);

// GET /messes/nearby — student only
router.get(
  '/nearby',
  authenticate,
  requireRole('student'),
  async (req: Request, res: Response): Promise<void> => {
    const { lat, lng, radius } = req.query as { lat?: string; lng?: string; radius?: string };

    if (!lat || !lng) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'lat and lng query parameters are required',
      });
      return;
    }

    const studentLat = parseFloat(lat);
    const studentLng = parseFloat(lng);
    const radiusKm = radius ? parseFloat(radius) : 2;

    if (isNaN(studentLat) || isNaN(studentLng) || isNaN(radiusKm)) {
      res.status(400).json({ error: 'VALIDATION_ERROR', message: 'lat, lng, and radius must be valid numbers' });
      return;
    }

    // Use PostGIS ST_DWithin via Supabase RPC for proximity search
    const { data, error } = await supabase.rpc('get_nearby_messes', {
      student_lat: studentLat,
      student_lng: studentLng,
      radius_km: radiusKm,
    });

    if (error) {
      res.status(503).json({ error: 'SERVICE_UNAVAILABLE', message: 'Location-based search is temporarily unavailable' });
      return;
    }

    if (!data || data.length === 0) {
      res.json({ messes: [], message: 'No messes found nearby' });
      return;
    }

    // Add distance_km and sort ascending
    const withDistance = (data as Array<Record<string, unknown>>)
      .map((mess) => ({
        ...mess,
        distance_km: haversineKm(studentLat, studentLng, mess.latitude as number, mess.longitude as number),
      }))
      .sort((a, b) => a.distance_km - b.distance_km);

    res.json({ messes: withDistance });
  }
);

// GET /messes/mine — mess_owner only (must come before /:id)
router.get(
  '/mine',
  authenticate,
  requireRole('mess_owner'),
  async (req: Request, res: Response): Promise<void> => {
    const { data, error } = await supabase
      .from('messes')
      .select('*')
      .eq('owner_id', req.user!.id);

    if (error) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
      return;
    }

    res.json(data);
  }
);

// PATCH /messes/:id/status — mess_owner only
router.patch(
  '/:id/status',
  authenticate,
  requireRole('mess_owner'),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { is_open } = req.body as { is_open: boolean };

    // Fetch the mess to verify ownership
    const { data: mess, error: fetchError } = await supabase
      .from('messes')
      .select('*')
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

    const { data: updated, error: updateError } = await supabase
      .from('messes')
      .update({ is_open })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: updateError.message });
      return;
    }

    res.json(updated);
  }
);

// GET /messes/:id — student only
router.get(
  '/:id',
  authenticate,
  requireRole('student'),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const { data: mess, error } = await supabase
      .from('messes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !mess) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Mess not found' });
      return;
    }

    const { lat, lng } = req.query as { lat?: string; lng?: string };

    if (lat !== undefined && lng !== undefined) {
      const studentLat = parseFloat(lat);
      const studentLng = parseFloat(lng);

      if (!isNaN(studentLat) && !isNaN(studentLng)) {
        mess.distance_km = haversineKm(studentLat, studentLng, mess.latitude, mess.longitude);
      }
    }

    res.json(mess);
  }
);

export default router;
