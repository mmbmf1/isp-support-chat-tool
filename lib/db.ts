import { Pool, QueryResult } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
// Try multiple paths to handle different execution contexts
const envPath = path.resolve(process.cwd(), '.env.local')
dotenv.config({ path: envPath })

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Please check your .env.local file.')
  process.exit(1)
}

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

export interface Scenario {
  id: number
  title: string
  description: string
  similarity?: number
}

/**
 * Search for similar scenarios using cosine similarity
 * @param embedding - 384-dimensional embedding vector
 * @param limit - Maximum number of results to return (default: 5)
 * @returns Array of scenarios with similarity scores
 */
export async function searchSimilarScenarios(
  embedding: number[],
  limit: number = 5,
): Promise<Scenario[]> {
  const query = `
        SELECT 
            id,
            title,
            description,
            1 - (embedding <=> $1::vector) as similarity
        FROM isp_support.scenarios
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> $1::vector
        LIMIT $2
    `

  try {
    const result: QueryResult<Scenario> = await pool.query(query, [
      `[${embedding.join(',')}]`,
      limit,
    ])

    return result.rows
  } catch (error) {
    console.error('Error searching similar scenarios:', error)
    throw error
  }
}

/**
 * Insert a scenario with its embedding
 * @param title - Scenario title
 * @param description - Scenario description
 * @param embedding - 384-dimensional embedding vector
 */
export async function insertScenario(
  title: string,
  description: string,
  embedding: number[],
): Promise<void> {
  const query = `
        INSERT INTO isp_support.scenarios (title, description, embedding)
        VALUES ($1, $2, $3::vector)
    `

  try {
    await pool.query(query, [title, description, `[${embedding.join(',')}]`])
  } catch (error) {
    console.error('Error inserting scenario:', error)
    throw error
  }
}

/**
 * Record user feedback for a scenario
 * @param query - The user's search query
 * @param scenarioId - The ID of the scenario that was rated
 * @param rating - 1 for thumbs up, -1 for thumbs down
 */
export async function recordFeedback(
  query: string,
  scenarioId: number,
  rating: number,
): Promise<void> {
  const feedbackQuery = `
    INSERT INTO isp_support.feedback (query, scenario_id, rating)
    VALUES ($1, $2, $3)
  `

  try {
    await pool.query(feedbackQuery, [query, scenarioId, rating])
  } catch (error) {
    console.error('Error recording feedback:', error)
    // Don't throw - feedback is non-critical, don't break the app
  }
}

/**
 * Close the database connection pool
 */
export async function closePool(): Promise<void> {
  await pool.end()
}
