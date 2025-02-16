// services/supabase.js
const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Initialize PostgreSQL pool for sessions
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Supabase SSL
    }
});

module.exports = { supabase, pool };