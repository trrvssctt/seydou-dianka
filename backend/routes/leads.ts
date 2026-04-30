import express from 'express';
import { query } from '../models/db.js';
import { authMiddleware, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all leads (admin only)
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM public.leads ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// Get single lead (admin only)
router.get('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM public.leads WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

// Submit new lead (public)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, email, company, role, mission_type, budget, message } = req.body;

    // Validate
    if (!name || name.length < 1 || name.length > 100) {
      return res.status(400).json({ error: 'Name must be 1-100 characters' });
    }
    if (!email || email.length < 3 || email.length > 255) {
      return res.status(400).json({ error: 'Email must be 3-255 characters' });
    }
    if (!message || message.length < 1 || message.length > 2000) {
      return res.status(400).json({ error: 'Message must be 1-2000 characters' });
    }

    const result = await query(
      `INSERT INTO public.leads (name, email, company, role, mission_type, budget, message, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'new', NOW())
       RETURNING *`,
      [name, email, company || null, role || null, mission_type || null, budget || null, message]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Lead creation error:', error);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// Update lead status (admin only)
router.patch('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['new', 'contacted', 'qualified', 'won', 'lost'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await query(
      'UPDATE public.leads SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// Delete lead (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM public.leads WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

export default router;
