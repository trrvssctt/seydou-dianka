import express from 'express';
import { query } from '../models/db.js';
import { authMiddleware, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all case studies (public gets published only)
router.get('/', optionalAuth, async (req, res) => {
  try {
    let sql = 'SELECT * FROM public.case_studies';
    const params = [];

    // If not admin, only show published
    if (!req.user?.isAdmin) {
      sql += ' WHERE published = true';
    }

    sql += ' ORDER BY order_index ASC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch case studies' });
  }
});

// Get single case study
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    let sql = 'SELECT * FROM public.case_studies WHERE id = $1';
    const params = [req.params.id];

    // If not admin, only show published
    if (!req.user?.isAdmin) {
      sql += ' AND published = true';
    }

    const result = await query(sql, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Case study not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch case study' });
  }
});

// Create case study (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const {
      number,
      badge,
      title_en,
      title_fr,
      subtitle,
      problem_en,
      problem_fr,
      solution_en,
      solution_fr,
      tech,
      metrics,
      testimonial_en,
      testimonial_fr,
      testimonial_author,
      order_index,
      published,
    } = req.body;

    if (!title_en || !title_fr) {
      return res.status(400).json({ error: 'Title in English and French required' });
    }

    const result = await query(
      `INSERT INTO public.case_studies
       (number, badge, title_en, title_fr, subtitle, problem_en, problem_fr, solution_en, solution_fr, tech, metrics, testimonial_en, testimonial_fr, testimonial_author, order_index, published, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
       RETURNING *`,
      [
        number ?? '',
        badge || null,
        title_en,
        title_fr,
        subtitle || null,
        problem_en || null,
        problem_fr || null,
        solution_en || null,
        solution_fr || null,
        tech || [],
        JSON.stringify(metrics || []),
        testimonial_en || null,
        testimonial_fr || null,
        testimonial_author || null,
        order_index || 0,
        published !== false,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Case study creation error:', error);
    res.status(500).json({ error: 'Failed to create case study' });
  }
});

// Update case study (admin only)
router.patch('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const updates = req.body;
    const allowedFields = [
      'number', 'badge', 'title_en', 'title_fr', 'subtitle',
      'problem_en', 'problem_fr', 'solution_en', 'solution_fr',
      'tech', 'metrics', 'testimonial_en', 'testimonial_fr',
      'testimonial_author', 'order_index', 'published'
    ];

    // Filter allowed fields
    const updateFields = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .map((key, index) => `${key} = $${index + 1}`);

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const values = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .map(key => key === 'metrics' ? JSON.stringify(updates[key]) : updates[key]);

    const result = await query(
      `UPDATE public.case_studies SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${values.length + 1} RETURNING *`,
      [...values, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Case study not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Case study update error:', error);
    res.status(500).json({ error: 'Failed to update case study' });
  }
});

// Delete case study (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM public.case_studies WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Case study not found' });
    }

    res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete case study' });
  }
});

export default router;
