'use client'

import { useState, useEffect } from 'react'
import {
  XMarkIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'

interface ResolutionModalProps {
  title: string
  steps: string[]
  stepType: 'numbered' | 'bullets'
  isOpen: boolean
  onClose: () => void
  scenarioId: number
  onFeedback: (scenarioId: number, rating: number) => void
  isRated: boolean
}

interface WorkOrder {
  id: number
  title: string
  description: string
  metadata?: Record<string, any>
}

export default function ResolutionModal({
  title,
  steps,
  stepType,
  isOpen,
  onClose,
  scenarioId,
  onFeedback,
  isRated,
}: ResolutionModalProps) {
  const [workOrderNames, setWorkOrderNames] = useState<string[]>([])
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(
    null,
  )

  useEffect(() => {
    if (isOpen) {
      // Fetch all work order names
      fetch('/api/work-order')
        .then((res) => res.json())
        .then((data) => {
          if (data.names) {
            setWorkOrderNames(data.names)
          }
        })
        .catch((err) => console.error('Failed to fetch work orders:', err))
    }
  }, [isOpen])

  /**
   * Finds a work order name in text when it appears in a "work order" context.
   * Only matches patterns like "Create a [Name] work order" or "[Name] work order".
   * @param text - The text to search
   * @returns Work order match with name and regex match, or null if not found
   */
  const findWorkOrderInText = (
    text: string,
  ): { name: string; match: RegExpMatchArray } | null => {
    if (!workOrderNames.length) return null

    // Check if any work order name appears in a "work order" context
    for (const name of workOrderNames) {
      // Match patterns like:
      // - "Create a [Name] work order"
      // - "Create an [Name] work order"
      // - "[Name] work order"
      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const patterns = [
        new RegExp(
          `\\b(create|Create)\\s+(a|an|the)?\\s+(${escapedName})\\s+work\\s+order\\b`,
          'i',
        ),
        new RegExp(`\\b(${escapedName})\\s+work\\s+order\\b`, 'i'),
      ]

      for (const pattern of patterns) {
        const match = text.match(pattern)
        if (match && match.index !== undefined) {
          return { name, match }
        }
      }
    }
    return null
  }

  const handleWorkOrderClick = async (name: string) => {
    try {
      const response = await fetch(
        `/api/work-order?name=${encodeURIComponent(name)}`,
      )
      if (!response.ok) {
        throw new Error(`Failed to fetch work order: ${response.statusText}`)
      }
      const workOrder = await response.json()
      setSelectedWorkOrder(workOrder)
    } catch (err) {
      console.error('Failed to fetch work order:', err)
    }
  }

  const renderStepWithWorkOrders = (step: string) => {
    const workOrderMatch = findWorkOrderInText(step)

    if (!workOrderMatch) {
      return <span>{step}</span>
    }

    const { name: workOrderName, match } = workOrderMatch
    const matchIndex = match.index
    if (matchIndex === undefined) {
      return <span>{step}</span>
    }

    const beforeMatch = step.substring(0, matchIndex)
    const afterMatch = step.substring(matchIndex + match[0].length)

    // Pattern 1: "Create a [Name] work order" - match[1] = "create", match[2] = "a/an/the", match[3] = work order name
    // Pattern 2: "[Name] work order" - match[1] = work order name
    const workOrderText = match[3] || match[1] || workOrderName
    const hasCreatePrefix = match[1] && match[1].toLowerCase() === 'create'
    const prefix = hasCreatePrefix
      ? `${match[1]} ${match[2] ? match[2] + ' ' : ''}`
      : ''

    return (
      <span>
        {beforeMatch}
        {prefix && <span>{prefix}</span>}
        <button
          onClick={() => handleWorkOrderClick(workOrderName)}
          className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors underline decoration-dotted"
        >
          {workOrderText}
          <InformationCircleIcon className="w-4 h-4" />
        </button>
        <span> work order</span>
        {afterMatch}
      </span>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">
            Resolution Steps
          </h3>
          <ol className="space-y-3">
            {stepType === 'numbered' ? (
              steps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-sm">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-slate-700 leading-relaxed pt-1">
                    {renderStepWithWorkOrders(step)}
                  </span>
                </li>
              ))
            ) : (
              steps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2.5" />
                  <span className="flex-1 text-slate-700 leading-relaxed">
                    {renderStepWithWorkOrders(step)}
                  </span>
                </li>
              ))
            )}
          </ol>

          {selectedWorkOrder && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-blue-900">
                  {selectedWorkOrder.title}
                </h4>
                <button
                  onClick={() => setSelectedWorkOrder(null)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              {selectedWorkOrder.description && (
                <p className="text-sm text-blue-800 mb-3">
                  {selectedWorkOrder.description}
                </p>
              )}
              {selectedWorkOrder.metadata && (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {selectedWorkOrder.metadata.time_bound !== undefined && (
                    <div>
                      <span className="text-blue-600 font-medium">Time Bound: </span>
                      <span className="text-blue-800">
                        {selectedWorkOrder.metadata.time_bound ? 'Yes' : 'No'}
                      </span>
                    </div>
                  )}
                  {selectedWorkOrder.metadata.no_truck !== undefined && (
                    <div>
                      <span className="text-blue-600 font-medium">Truck Required: </span>
                      <span className="text-blue-800">
                        {selectedWorkOrder.metadata.no_truck ? 'No' : 'Yes'}
                      </span>
                    </div>
                  )}
                  {selectedWorkOrder.metadata.sla && (
                    <div>
                      <span className="text-blue-600 font-medium">SLA: </span>
                      <span className="text-blue-800">
                        {selectedWorkOrder.metadata.sla}
                      </span>
                    </div>
                  )}
                  {selectedWorkOrder.metadata.customer_service_impacting && (
                    <div>
                      <span className="text-blue-600 font-medium">Service Impacting: </span>
                      <span className="text-blue-800">
                        {selectedWorkOrder.metadata.customer_service_impacting}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50">
          {isRated ? (
            <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
              <CheckCircleIcon className="w-5 h-5" />
              <span className="font-medium">Thank you for your feedback</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-sm text-slate-600 font-medium">
                Did this help?
              </span>
              <button
                onClick={() => {
                  onFeedback(scenarioId, 1)
                  onClose()
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition-colors font-medium"
              >
                <HandThumbUpIcon className="w-5 h-5" />
                <span>Helpful</span>
              </button>
              <button
                onClick={() => {
                  onFeedback(scenarioId, -1)
                  onClose()
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition-colors font-medium"
              >
                <HandThumbDownIcon className="w-5 h-5" />
                <span>Not helpful</span>
              </button>
            </div>
          )}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
