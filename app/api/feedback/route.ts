import { NextRequest, NextResponse } from 'next/server'
import { recordFeedback } from '@/lib/db'
import { validateString, validateInteger, validationError } from '@/lib/api-validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, scenarioId, rating } = body

    const queryError = validateString(query, 'Query')
    if (queryError) return validationError(queryError)

    const scenarioIdError = validateInteger(scenarioId, 'Scenario ID')
    if (scenarioIdError) return validationError(scenarioIdError)

    if (rating !== 1 && rating !== -1) {
      return validationError('Rating must be 1 or -1')
    }

    await recordFeedback(query.trim(), scenarioId, rating)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
