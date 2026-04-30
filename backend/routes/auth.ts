import express from 'express';
import bcrypt from 'bcrypt';
import { query } from '../models/db.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Check if user exists
    const existing = await query('SELECT id FROM auth.users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (simulate Supabase auth.users table)
    const result = await query(
      `INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW(), NOW())
       RETURNING id, email`,
      [email, hashedPassword]
    );

    const user = result.rows[0];
    const token = generateToken(user.id, false);

    res.status(201).json({
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Sign in
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const result = await query(
      'SELECT id, email, encrypted_password FROM auth.users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.encrypted_password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is admin
    const roleResult = await query(
      'SELECT role FROM public.user_roles WHERE user_id = $1 AND role = $2',
      [user.id, 'admin']
    );

    const isAdmin = roleResult.rows.length > 0;
    const token = generateToken(user.id, isAdmin);

    res.json({
      user: { id: user.id, email: user.email, isAdmin },
      token,
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Signin failed' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, email FROM auth.users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0], isAdmin: req.user.isAdmin });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get current user' });
  }
});

// Claim admin — premier utilisateur à appeler cet endpoint sans admin existant devient admin
router.post('/claim-admin', authMiddleware, async (req, res) => {
  try {
    const existing = await query(
      `SELECT id FROM public.user_roles WHERE role = 'admin' LIMIT 1`
    );
    if (existing.rows.length > 0) {
      return res.json({ success: false, message: 'An admin already exists' });
    }
    await query(
      `INSERT INTO public.user_roles (user_id, role, created_at) VALUES ($1, 'admin', NOW())`,
      [req.user.userId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to claim admin' });
  }
});

export default router;
