import { pipeline, Pipeline } from '@huggingface/transformers'

// Singleton pattern for lazy loading the embedding pipeline
class PipelineSingleton {
  private static instance: Promise<Pipeline> | null = null
  private static readonly task = 'feature-extraction'
  private static readonly model = 'Xenova/all-MiniLM-L6-v2'

  static async getInstance(): Promise<Pipeline> {
    if (!this.instance) {
      this.instance = pipeline(this.task, this.model)
    }
    return this.instance
  }
}

// Preserve instance in development to survive hot reloads
const getPipelineSingleton = (): typeof PipelineSingleton => {
  if (process.env.NODE_ENV !== 'production') {
    if (!global.PipelineSingleton) {
      global.PipelineSingleton = PipelineSingleton
    }
    return global.PipelineSingleton
  }
  return PipelineSingleton
}

declare global {
  var PipelineSingleton: typeof PipelineSingleton
}

/**
 * Generate embedding vector for given text
 * @param text - Input text to generate embedding for
 * @returns Promise resolving to 384-dimensional vector array
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const Pipeline = getPipelineSingleton()
  const extractor = await Pipeline.getInstance()
  const output = await extractor(text, { pooling: 'mean', normalize: true })

  // Extract tensor data and convert to array
  const tensorData = (output as { data: Float32Array | number[] }).data
  const embedding = Array.from(tensorData)

  // Validate and convert to numbers
  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error('Failed to extract embedding vector')
  }

  return embedding.map((v) => Number(v))
}
