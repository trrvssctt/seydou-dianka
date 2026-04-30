import express from 'express';
import { query } from '../models/db.js';
import { authMiddleware, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all workflows (public gets published only)
router.get('/', optionalAuth, async (req, res) => {
  try {
    let sql = 'SELECT * FROM public.workflows';
    const params = [];

    if (!req.user?.isAdmin) {
      sql += ' WHERE published = true';
    }

    sql += ' ORDER BY order_index ASC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
});

// Get single workflow
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    let sql = 'SELECT * FROM public.workflows WHERE id = $1';
    const params = [req.params.id];

    if (!req.user?.isAdmin) {
      sql += ' AND published = true';
    }

    const result = await query(sql, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workflow' });
  }
});

// Create workflow (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const {
      title_en,
      title_fr,
      trigger_en,
      trigger_fr,
      steps_en,
      steps_fr,
      nodes,
      status,
      exec_time,
      order_index,
      published,
    } = req.body;

    if (!title_en || !title_fr) {
      return res.status(400).json({ error: 'Title in English and French required' });
    }

    const result = await query(
      `INSERT INTO public.workflows
       (title_en, title_fr, trigger_en, trigger_fr, steps_en, steps_fr, nodes, status, exec_time, order_index, published, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
       RETURNING *`,
      [
        title_en,
        title_fr,
        trigger_en || null,
        trigger_fr || null,
        steps_en || [],
        steps_fr || [],
        nodes || [],
        status || null,
        exec_time || null,
        order_index || 0,
        published !== false,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Workflow creation error:', error);
    res.status(500).json({ error: 'Failed to create workflow' });
  }
});

// Update workflow (admin only)
router.patch('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const updates = req.body;
    const allowedFields = [
      'title_en', 'title_fr', 'trigger_en', 'trigger_fr',
      'steps_en', 'steps_fr', 'nodes', 'status', 'exec_time',
      'order_index', 'published'
    ];

    const updateFields = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .map((key, index) => `${key} = $${index + 1}`);

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const values = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .map(key => updates[key]);

    const result = await query(
      `UPDATE public.workflows SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${values.length + 1} RETURNING *`,
      [...values, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Workflow update error:', error);
    res.status(500).json({ error: 'Failed to update workflow' });
  }
});

// Delete workflow (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM public.workflows WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete workflow' });
  }
});

export default router;
