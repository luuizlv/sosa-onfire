import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from "@shared/schema";

const { Pool } = pg;

// Use DATABASE_URL from environment - required for Supabase connection
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required for Supabase connection");
}

// Log URL for debugging (hide password)
const debugUrl = connectionString.replace(/:([^:@]{1,}@)/, ':****@');
console.log("Connecting to database:", debugUrl);

// Validate URL format
if (!connectionString.startsWith('postgresql://') && !connectionString.startsWith('postgres://')) {
  throw new Error("DATABASE_URL must be a valid PostgreSQL connection string starting with postgresql:// or postgres://");
}

// Create PostgreSQL pool for Supabase
const pool = new Pool({ 
  connectionString: connectionString!,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize Drizzle with the pool and schema
const db = drizzle(pool, { schema });

console.log("Database connected successfully to Supabase");

export { pool, db };