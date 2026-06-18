import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { supabase, supabaseAdmin } from '../lib/supabase';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// POST /upload/cover-image/:messId — Upload cover image for a mess
router.post(
  '/cover-image/:messId',
  authenticate,
  requireRole('mess_owner'),
  upload.single('image'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { messId } = req.params;
      const file = req.file;

      console.log('📸 Upload request for mess:', messId);
      console.log('📸 User ID:', req.user?.id);
      console.log('📸 File:', file ? `${file.originalname} (${file.size} bytes)` : 'No file');

      if (!file) {
        res.status(400).json({ error: 'VALIDATION_ERROR', message: 'No image file provided' });
        return;
      }

      // Check if mess exists and user owns it
      const { data: mess, error: fetchError } = await supabase
        .from('messes')
        .select('id, owner_id, cover_image_url')
        .eq('id', messId)
        .single();

      console.log('📸 Mess query result:', { mess, error: fetchError });

      if (fetchError || !mess) {
        console.error('❌ Mess not found:', messId);
        res.status(404).json({ error: 'NOT_FOUND', message: 'Mess not found' });
        return;
      }

      if (mess.owner_id !== req.user!.id) {
        console.error('❌ Ownership mismatch:', { messOwnerId: mess.owner_id, userId: req.user!.id });
        res.status(403).json({ error: 'FORBIDDEN', message: 'You do not own this mess' });
        return;
      }

      // Delete old image if exists
      if (mess.cover_image_url) {
        try {
          const oldFileName = mess.cover_image_url.split('/').pop();
          if (oldFileName) {
            await supabaseAdmin.storage
              .from('mess-covers')
              .remove([`covers/${oldFileName}`]);
          }
        } catch (deleteError) {
          console.log('Could not delete old image:', deleteError);
          // Continue anyway
        }
      }

      // Generate unique filename
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${messId}-${Date.now()}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      // Upload to Supabase Storage using admin client (bypasses RLS)
      const { error: uploadError } = await supabaseAdmin.storage
        .from('mess-covers')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        
        // Check if bucket doesn't exist
        if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('bucket')) {
          res.status(500).json({ 
            error: 'STORAGE_NOT_CONFIGURED', 
            message: 'Supabase Storage bucket "mess-covers" not found. Please create it in Supabase Dashboard → Storage → New Bucket (name: mess-covers, public: enabled).' 
          });
          return;
        }
        
        res.status(500).json({ error: 'UPLOAD_ERROR', message: uploadError.message });
        return;
      }

      // Get public URL using admin client
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('mess-covers')
        .getPublicUrl(filePath);

      // Update mess with new cover image URL
      const { data: updated, error: updateError } = await supabase
        .from('messes')
        .update({ cover_image_url: publicUrl })
        .eq('id', messId)
        .select()
        .single();

      if (updateError) {
        res.status(500).json({ error: 'UPDATE_ERROR', message: updateError.message });
        return;
      }

      res.json({
        message: 'Cover image uploaded successfully',
        cover_image_url: publicUrl,
        mess: updated,
      });
    } catch (error: any) {
      console.error('Error uploading cover image:', error);
      res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
    }
  }
);

export default router;
