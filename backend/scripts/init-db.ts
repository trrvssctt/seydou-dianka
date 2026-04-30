import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
});

async function initDb() {
  console.log('🚀 Initializing database...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Create auth schema if not exists
    console.log('📁 Creating auth schema...');
    await client.query('CREATE SCHEMA IF NOT EXISTS auth');

    // 2. Create auth.users table if not exists
    console.log('👥 Creating auth.users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS auth.users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email text UNIQUE NOT NULL,
        encrypted_password text NOT NULL,
        email_confirmed_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    // 3. Execute db.sql for public schema
    console.log('📜 Executing db.sql...');
    const sqlPath = path.join(__dirname, '../../db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL into statements (simplified, might need better parsing if there are complex triggers)
    // Actually, for simplicity, we can just run the whole file if it's well-formed
    // But some statements like CREATE TYPE might fail if already exists
    
    // Let's try to run the whole thing, but we need to handle "already exists" errors
    try {
        await client.query(sql);
    } catch (e) {
        if (e.message.includes('already exists')) {
            console.warn('⚠️ Some objects already exist, skipping direct execution. You might need to manually update the schema if it changed.');
        } else {
            throw e;
        }
    }

    await client.query('COMMIT');
    console.log('✅ Database initialization complete!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Database initialization failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

initDb();
