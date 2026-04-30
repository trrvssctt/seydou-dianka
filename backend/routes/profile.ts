import express from 'express';
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { fileURLToPath } from 'url';
import { query } from '../models/db.js';
import { authMiddleware, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get profile (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const result = await query('SELECT * FROM public.profile LIMIT 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile (admin only)
router.patch('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const updates = req.body;
    const allowedFields = [
      'full_name', 'title_en', 'title_fr', 'bio_en', 'bio_fr',
      'email', 'phone', 'location', 'avatar_url',
      'github_url', 'linkedin_url', 'twitter_url', 'calendar_url',
    ];

    const filtered = Object.keys(updates).filter(k => allowedFields.includes(k));
    if (filtered.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const setClauses = filtered.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = filtered.map(k => updates[k]);

    const result = await query(
      `UPDATE public.profile SET ${setClauses}, updated_at = NOW()
       WHERE id = (SELECT id FROM public.profile LIMIT 1) RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload avatar (admin only) — accepts base64 data
router.post('/avatar', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { filename, data } = req.body;
    if (!filename || !data) {
      return res.status(400).json({ error: 'Filename and data required' });
    }

    const uploadsDir = path.join(__dirname, '../../uploads/avatars');
    await fsPromises.mkdir(uploadsDir, { recursive: true });

    const ext = (filename.split('.').pop() || 'jpg').replace(/[^a-zA-Z0-9]/g, '');
    const safeName = `avatar-${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, safeName);
    const base64Data = data.replace(/^data:[^;]+;base64,/, '');
    await fsPromises.writeFile(filePath, Buffer.from(base64Data, 'base64'));

    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    const avatarUrl = `${backendUrl}/uploads/avatars/${safeName}`;

    const result = await query(
      `UPDATE public.profile SET avatar_url = $1, updated_at = NOW()
       WHERE id = (SELECT id FROM public.profile LIMIT 1) RETURNING *`,
      [avatarUrl]
    );

    res.json({ url: avatarUrl, profile: result.rows[0] });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

export default router;
