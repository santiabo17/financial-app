import { Pool } from 'pg';

// Get the connection URL from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

// Create a new Pool instance
const pool = new Pool({
  connectionString: connectionString,
  // Optional: Set a max limit for the number of connections in the pool
  max: 20, 
  // Optional: Set an idle timeout in milliseconds
  idleTimeoutMillis: 30000, 
});

// Optional: Add a listener to log errors on idle clients
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  // Process kill is not recommended in production, but good for local debugging
  // process.exit(-1); 
});

export default pool;