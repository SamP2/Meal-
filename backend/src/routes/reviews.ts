import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { supabase } from '../lib/supabase';
import { CreateReviewBody } from '../types';

const router = Router({ mergeParams: true });

// GET /messes/:messId/reviews
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  const { messId } = req.params;
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(role)')
    .eq('mess_id', messId)
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
    return;
  }
  res.json(data ?? []);
});

// POST /messes/:messId/reviews — student only
router.post('/', authenticate, requireRole('student'), async (req: Request, res: Response): Promise<void> => {
  const { messId } = req.params;
  const { rating, comment } = req.body as CreateReviewBody;

  if (!rating || rating < 1 || rating > 5) {
    res.status(400).json({ error: 'VALIDATION_ERROR', field: 'rating', message: 'Rating must be between 1 and 5' });
    return;
  }

  const { data, error } = await supabase
    .from('reviews')
    .upsert({ mess_id: messId, student_id: req.user!.id, rating, comment: comment ?? null }, { onConflict: 'mess_id,student_id' })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
    return;
  }
  res.status(201).json(data);
});

// DELETE /messes/:messId/reviews/:reviewId — student only (own review)
router.delete('/:reviewId', authenticate, requireRole('student'), async (req: Request, res: Response): Promise<void> => {
  const { reviewId } = req.params;
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('student_id', req.user!.id);

  if (error) {
    res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
    return;
  }
  res.status(204).send();
});

export default router;
