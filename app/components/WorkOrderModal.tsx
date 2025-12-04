'use client'

import {
  XMarkIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

interface WorkOrderModalProps {
  workOrder: {
    id: number
    title: string
    description: string
    metadata?: Record<string, any>
  }
  isOpen: boolean
  onClose: () => void
  onFeedback: (scenarioId: number, rating: number) => void
  isRated: boolean
}

export default function WorkOrderModal({
  workOrder,
  isOpen,
  onClose,
  onFeedback,
  isRated,
}: WorkOrderModalProps) {
  if (!isOpen) return null

  const metadata = workOrder.metadata || {}

  const formatValue = (value: any): string => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }
    if (value === null || value === undefined) {
      return 'N/A'
    }
    return String(value)
  }

  const getMetadataFields = () => {
    const fields: Array<{ label: string; value: any }> = []

    if (metadata.no_truck !== undefined) {
      fields.push({
        label: 'Truck Required',
        value: metadata.no_truck ? 'No' : 'Yes',
      })
    }

    if (metadata.time_bound !== undefined) {
      fields.push({
        label: 'Time Bound',
        value: metadata.time_bound ? 'Yes' : 'No',
      })
    }

    if (metadata.sla) {
      fields.push({
        label: 'SLA',
        value: metadata.sla,
      })
    }

    if (metadata.customer_service_impacting) {
      fields.push({
        label: 'Customer Service Impacting',
        value: metadata.customer_service_impacting,
      })
    }

    if (metadata.conexon_job_only !== undefined) {
      fields.push({
        label: 'Conexon Job Only',
        value: metadata.conexon_job_only ? 'Yes' : 'No',
      })
    }

    if (metadata.category) {
      fields.push({
        label: 'Category',
        value: metadata.category,
      })
    }

    return fields
  }

  const metadataFields = getMetadataFields()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">{workOrder.title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {workOrder.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Description
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {workOrder.description}
              </p>
            </div>
          )}

          {metadataFields.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-4">
                Work Order Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metadataFields.map((field, index) => (
                  <div
                    key={index}
                    className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                  >
                    <div className="text-sm font-medium text-slate-500 mb-1">
                      {field.label}
                    </div>
                    <div className="text-base font-semibold text-slate-800">
                      {formatValue(field.value)}
                    </div>
                  </div>
                ))}
              </div>
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
                  onFeedback(workOrder.id, 1)
                  onClose()
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition-colors font-medium"
              >
                <HandThumbUpIcon className="w-5 h-5" />
                <span>Helpful</span>
              </button>
              <button
                onClick={() => {
                  onFeedback(workOrder.id, -1)
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
