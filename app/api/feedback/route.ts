import { NextRequest, NextResponse } from 'next/server'
import { recordFeedback } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, scenarioId, rating } = body

    // Validate input
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required and must be a non-empty string' },
        { status: 400 },
      )
    }

    if (
      !scenarioId ||
      typeof scenarioId !== 'number' ||
      !Number.isInteger(scenarioId)
    ) {
      return NextResponse.json(
        { error: 'Scenario ID is required and must be an integer' },
        { status: 400 },
      )
    }

    if (rating !== 1 && rating !== -1) {
      return NextResponse.json(
        { error: 'Rating must be 1 (thumbs up) or -1 (thumbs down)' },
        { status: 400 },
      )
    }

    // Record feedback (non-blocking, errors are handled internally)
    await recordFeedback(query.trim(), scenarioId, rating)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in feedback API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
