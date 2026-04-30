import express from 'express';
import { query } from '../models/db.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [leadsResult, cases, wf] = await Promise.all([
      query(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'new') AS new_leads
        FROM public.leads
      `),
      query('SELECT COUNT(*) FROM public.case_studies'),
      query('SELECT COUNT(*) FROM public.workflows'),
    ]);
    res.json({
      leads: parseInt(leadsResult.rows[0].total),
      newLeads: parseInt(leadsResult.rows[0].new_leads),
      cases: parseInt(cases.rows[0].count),
      workflows: parseInt(wf.rows[0].count),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
