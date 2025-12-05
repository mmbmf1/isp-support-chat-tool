import { NextRequest, NextResponse } from 'next/server'
import { logAction } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { actionType, itemName, itemType, scenarioId } = await request.json()
    if (!actionType) {
      return NextResponse.json({ error: 'actionType is required' }, { status: 400 })
    }
    logAction(actionType, itemName, itemType, scenarioId)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
