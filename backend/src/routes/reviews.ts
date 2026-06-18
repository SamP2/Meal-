import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /reviews/:messId — Get all reviews for a mess (PUBLIC)
router.get('/:messId', async (req: Request, res: Response): Promise<void> => {
  const { messId } = req.params;

  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('id, rating, comment, created_at')
      .eq('mess_id', messId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
      return;
    }

    // Calculate average rating and count
    const avgRating = reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      reviews: reviews || [],
      summary: {
        averageRating: parseFloat(avgRating.toFixed(1)),
        totalReviews: reviews?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /reviews/:messId:', error);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to fetch reviews' });
  }
});

// POST /reviews/:messId — Submit or update a review (PUBLIC)
router.post('/:messId', async (req: Request, res: Response): Promise<void> => {
  const { messId } = req.params;
  const { device_id, rating, comment } = req.body;

  // Validation
  if (!device_id || typeof device_id !== 'string') {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'device_id is required' });
    return;
  }

  if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'rating must be between 1 and 5' });
    return;
  }

  if (comment && typeof comment !== 'string') {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'comment must be a string' });
    return;
  }

  try {
    // Check if mess exists
    const { data: mess, error: messError } = await supabase
      .from('messes')
      .select('id')
      .eq('id', messId)
      .single();

    if (messError || !mess) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Mess not found' });
      return;
    }

    // Check if review already exists for this device
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('mess_id', messId)
      .eq('device_id', device_id)
      .single();

    let result;

    if (existingReview) {
      // Update existing review
      const { data, error } = await supabase
        .from('reviews')
        .update({
          rating,
          comment: comment || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingReview.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
        return;
      }

      result = data;
    } else {
      // Create new review
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          mess_id: messId,
          device_id,
          rating,
          comment: comment || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
        return;
      }

      result = data;
    }

    res.status(existingReview ? 200 : 201).json({
      review: result,
      message: existingReview ? 'Review updated successfully' : 'Review submitted successfully',
    });
  } catch (error: any) {
    console.error('Error in POST /reviews/:messId:', error);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to submit review' });
  }
});

// GET /reviews/:messId/user/:deviceId — Check if user has reviewed (PUBLIC)
router.get('/:messId/user/:deviceId', async (req: Request, res: Response): Promise<void> => {
  const { messId, deviceId } = req.params;

  try {
    const { data: review, error } = await supabase
      .from('reviews')
      .select('id, rating, comment, created_at')
      .eq('mess_id', messId)
      .eq('device_id', deviceId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching user review:', error);
      res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
      return;
    }

    res.json({
      hasReviewed: !!review,
      review: review || null,
    });
  } catch (error: any) {
    console.error('Error in GET /reviews/:messId/user/:deviceId:', error);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to check review status' });
  }
});

export default router;
