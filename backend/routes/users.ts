import express from 'express';
import { query } from '../models/db.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Get all user roles (admin only)
router.get('/roles', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await query(
      'SELECT ur.id, ur.user_id, ur.role, ur.created_at, u.email FROM public.user_roles ur JOIN auth.users u ON ur.user_id = u.id ORDER BY ur.created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user roles' });
  }
});

// Grant admin role (admin only)
router.post('/roles', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f-]{36}$/i;
    if (!uuidRegex.test(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    // Check if user exists
    const userExists = await query('SELECT id FROM auth.users WHERE id = $1', [userId]);
    if (userExists.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if role already exists
    const roleExists = await query(
      'SELECT id FROM public.user_roles WHERE user_id = $1 AND role = $2',
      [userId, 'admin']
    );

    if (roleExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already has admin role' });
    }

    // Create role
    const result = await query(
      `INSERT INTO public.user_roles (user_id, role, created_at)
       VALUES ($1, 'admin', NOW())
       RETURNING *`,
      [userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Grant role error:', error);
    res.status(500).json({ error: 'Failed to grant role' });
  }
});

// Revoke admin role (admin only)
router.delete('/roles/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if trying to revoke own admin
    const roleResult = await query(
      'SELECT user_id FROM public.user_roles WHERE id = $1',
      [id]
    );

    if (roleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }

    if (roleResult.rows[0].user_id === req.user.userId) {
      return res.status(403).json({ error: 'Cannot revoke your own admin role' });
    }

    // Delete role
    const result = await query(
      'DELETE FROM public.user_roles WHERE id = $1 RETURNING id',
      [id]
    );

    res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke role' });
  }
});

export default router;
