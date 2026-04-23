import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// ============================================================================
// PostgreSQL Connection Pool Configuration
// ============================================================================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// ============================================================================
// Connection Error Handling (Graceful, Non-Crashing)
// ============================================================================

pool.on('error', (err: Error) => {
  console.error('❌ Unexpected database pool error:', err);
  // DO NOT crash the process - log and continue
});

pool.on('connect', () => {
  console.log('✅ Database connection established');
});

// ============================================================================
// Health Check Function
// ============================================================================

export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const result = await pool.query('SELECT NOW()');
    return result.rows.length > 0;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
};

// ============================================================================
// Query Wrapper with Error Handling
// ============================================================================

export const query = async <T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  const start = Date.now();
  
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries (> 1000ms)
    if (duration > 1000) {
      console.warn(`⚠️  Slow query detected (${duration}ms):`, text.substring(0, 100));
    }
    
    return result;
  } catch (error) {
    console.error('❌ Database query error:', error);
    console.error('Query:', text);
    console.error('Params:', params);
    throw error;
  }
};

// ============================================================================
// Transaction Helper
// ============================================================================

export const transaction = async <T>(
  callback: (client: any) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Transaction rolled back:', error);
    throw error;
  } finally {
    client.release();
  }
};

// ============================================================================
// Graceful Shutdown
// ============================================================================

export const closePool = async (): Promise<void> => {
  try {
    await pool.end();
    console.log('✅ Database pool closed gracefully');
  } catch (error) {
    console.error('❌ Error closing database pool:', error);
  }
};

// Handle process termination
process.on('SIGTERM', closePool);
process.on('SIGINT', closePool);

// ============================================================================
// Export Pool (for advanced use cases)
// ============================================================================

export default pool;
