import { NextRequest, NextResponse } from 'next/server'
import { getWorkOrderByName, getAllWorkOrderNames } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const name = searchParams.get('name')

    if (name) {
      // Get specific work order by name
      const workOrder = await getWorkOrderByName(name)
      if (!workOrder) {
        return NextResponse.json(
          { error: 'Work order not found' },
          { status: 404 },
        )
      }
      return NextResponse.json(workOrder)
    } else {
      // Get all work order names
      const names = await getAllWorkOrderNames()
      return NextResponse.json({ names })
    }
  } catch (error) {
    console.error('Error in work order API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
