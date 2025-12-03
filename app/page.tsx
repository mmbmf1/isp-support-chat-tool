'use client'

import { useState, FormEvent } from 'react'
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import ResolutionModal from './components/ResolutionModal'

interface SearchResult {
  id: number
  title: string
  description: string
  helpful_count?: number
  total_feedback?: number
  helpful_percentage?: number
}

interface Resolution {
  id: number
  scenario_id: number
  steps: string[]
  step_type: 'numbered' | 'bullets'
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ratedScenarios, setRatedScenarios] = useState<Set<number>>(new Set())
  const [showResolutionModal, setShowResolutionModal] = useState(false)
  const [selectedResolution, setSelectedResolution] =
    useState<Resolution | null>(null)
  const [selectedScenarioTitle, setSelectedScenarioTitle] = useState('')

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault()

    if (!query.trim()) {
      return
    }

    setLoading(true)
    setError(null)
    setResults([])

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Search failed')
      }

      const data = await response.json()
      setResults(data.results || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = async (scenarioId: number, rating: number) => {
    if (ratedScenarios.has(scenarioId)) return

    if (rating === 1) {
      try {
        const response = await fetch(`/api/resolution?scenarioId=${scenarioId}`)
        if (response.ok) {
          const resolution: Resolution = await response.json()
          const scenario = results.find((r) => r.id === scenarioId)
          setSelectedResolution(resolution)
          setSelectedScenarioTitle(scenario?.title || '')
          setShowResolutionModal(true)
        } else {
          await submitFeedback(scenarioId, rating)
        }
      } catch (err) {
        console.error('Failed to fetch resolution:', err)
        await submitFeedback(scenarioId, rating)
      }
    } else {
      await submitFeedback(scenarioId, rating)
    }
  }

  const submitFeedback = async (scenarioId: number, rating: number) => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, scenarioId, rating }),
      })
      setRatedScenarios(new Set([...ratedScenarios, scenarioId]))
    } catch (err) {
      console.error('Failed to submit feedback:', err)
    }
  }

  const handleCloseModal = () => {
    setShowResolutionModal(false)
    if (selectedResolution) {
      submitFeedback(selectedResolution.scenario_id, 1)
      setSelectedResolution(null)
      setSelectedScenarioTitle('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-8 mb-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Troubleshooting Search
            </h1>
            <p className="text-slate-600">
              Find solutions for common ISP issues
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., router light is red, no internet connection..."
                className="flex-1 px-5 py-3.5 text-slate-700 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-8 py-3.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-800">
              <span className="font-medium">{error}</span>
            </div>
          )}
        </div>

        {loading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-blue-200 border-t-blue-600 mb-4"></div>
            <p className="text-slate-600">Searching...</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, index) => {
              const isRated = ratedScenarios.has(result.id)
              return (
                <div
                  key={result.id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-200/50 p-6 hover:shadow-xl hover:border-blue-300/50 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-slate-800">
                          {result.title}
                        </h3>
                        {result.helpful_percentage !== null &&
                          result.helpful_percentage !== undefined &&
                          result.total_feedback &&
                          result.total_feedback > 0 && (
                            <div className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                              {result.helpful_percentage}% ({result.total_feedback})
                            </div>
                          )}
                      </div>
                      <p className="text-slate-600 leading-relaxed mb-4">
                        {result.description}
                      </p>
                      {isRated ? (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircleIcon className="w-4 h-4" />
                          <span>Thank you for your feedback</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleFeedback(result.id, 1)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition-colors text-sm"
                          >
                            <HandThumbUpIcon className="w-4 h-4" />
                            <span>Helpful</span>
                          </button>
                          <button
                            onClick={() => handleFeedback(result.id, -1)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition-colors text-sm"
                          >
                            <HandThumbDownIcon className="w-4 h-4" />
                            <span>Not helpful</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && results.length === 0 && query && !error && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-12 text-center">
            <p className="text-slate-600 text-lg mb-2">No results found</p>
            <p className="text-slate-500">Try a different query</p>
          </div>
        )}
      </div>

      {selectedResolution && (
        <ResolutionModal
          title={selectedScenarioTitle}
          steps={selectedResolution.steps}
          stepType={selectedResolution.step_type}
          isOpen={showResolutionModal}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
