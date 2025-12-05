import { NextRequest, NextResponse } from 'next/server'
import { generateEmbedding } from '@/lib/embeddings'
import { searchSimilarScenarios, logSearch } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { query, type } = await request.json()

    if (!query?.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const trimmedQuery = query.trim()
    logSearch(trimmedQuery).catch(() => {})

    const queryEmbedding = await generateEmbedding(trimmedQuery)
    const results = await searchSimilarScenarios(
      queryEmbedding,
      5,
      (type || 'scenario') as 'scenario' | 'work_order',
    )

    return NextResponse.json({ results })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
