import { NextRequest, NextResponse } from 'next/server'

const ACTION_CONFIG: Record<
  string,
  {
    delay: number
    getMessage: (params: any) => string
    getResults?: (params: any) => any
  }
> = {
  'reset-router': {
    delay: 1500,
    getMessage: (params: { equipmentName?: string; equipmentId?: string }) =>
      `Router ${params.equipmentName || params.equipmentId} reset successfully`,
  },
  'restart-equipment': {
    delay: 2000,
    getMessage: (params: {
      equipmentName?: string
      equipmentId?: string
      equipmentType?: string
    }) =>
      `${params.equipmentType || 'Equipment'} ${params.equipmentName || params.equipmentId} restarted successfully`,
  },
  'speed-test': {
    delay: 2000,
    getMessage: (params: {
      subscriberName?: string
      subscriberId?: string
    }) => {
      const downloadSpeed = Math.floor(Math.random() * 500) + 100
      const uploadSpeed = Math.floor(Math.random() * 100) + 20
      const latency = Math.floor(Math.random() * 30) + 10
      return `Speed test completed: ${downloadSpeed} Mbps down, ${uploadSpeed} Mbps up, ${latency} ms latency`
    },
    getResults: () => {
      const downloadSpeed = Math.floor(Math.random() * 500) + 100
      const uploadSpeed = Math.floor(Math.random() * 100) + 20
      const latency = Math.floor(Math.random() * 30) + 10
      return {
        downloadSpeed: `${downloadSpeed} Mbps`,
        uploadSpeed: `${uploadSpeed} Mbps`,
        latency: `${latency} ms`,
        timestamp: new Date().toISOString(),
      }
    },
  },
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ actionType: string }> },
) {
  try {
    const { actionType } = await params
    const body = await request.json()

    const config = ACTION_CONFIG[actionType]
    if (!config) {
      return NextResponse.json(
        { error: `Unknown action type: ${actionType}` },
        { status: 400 },
      )
    }

    // Validate required params based on action type
    if (actionType === 'speed-test') {
      if (!body.subscriberId && !body.subscriberName) {
        return NextResponse.json(
          { error: 'Subscriber ID or name required' },
          { status: 400 },
        )
      }
    } else {
      if (!body.equipmentId && !body.equipmentName) {
        return NextResponse.json(
          { error: 'Equipment ID or name required' },
          { status: 400 },
        )
      }
    }

    // Mock action execution - in real implementation, this would call actual API
    await new Promise((resolve) => setTimeout(resolve, config.delay))

    const message = config.getMessage(body)
    const response: any = {
      success: true,
      message,
      timestamp: new Date().toISOString(),
    }

    if (config.getResults) {
      response.results = config.getResults(body)
    }

    return NextResponse.json(response)
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to execute action'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
