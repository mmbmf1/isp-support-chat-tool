import { pipeline } from '@huggingface/transformers'

// Use the Singleton pattern to enable lazy construction of the pipeline.
// Wrap the class in a function to prevent code duplication
const P = () =>
  class PipelineSingleton {
    static task = 'feature-extraction'
    static model = 'Xenova/all-MiniLM-L6-v2'
    static instance: any = null

    static async getInstance() {
      if (this.instance === null) {
        this.instance = pipeline(this.task, this.model)
      }
      return this.instance
    }
  }

// Preserve pipeline instance in development to survive hot reloads
let PipelineSingleton: ReturnType<typeof P>
if (process.env.NODE_ENV !== 'production') {
  if (!global.PipelineSingleton) {
    global.PipelineSingleton = P()
  }
  PipelineSingleton = global.PipelineSingleton
} else {
  PipelineSingleton = P()
}

// Extend global type for TypeScript
declare global {
  var PipelineSingleton: ReturnType<typeof P>
}

/**
 * Generate embedding vector for given text
 * @param text - Input text to generate embedding for
 * @returns Promise resolving to 384-dimensional vector array
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const extractor = await PipelineSingleton.getInstance()
  const output = await extractor(text, { pooling: 'mean', normalize: true })

  // Extract the embedding array from the output
  // The output from transformers.js feature-extraction pipeline is a Tensor
  // We need to convert it to a regular JavaScript array
  let embedding: number[]

  try {
    // Check if output has a .data property (Tensor object)
    if (output && typeof output === 'object' && 'data' in output) {
      const tensorData = (output as any).data
      // If data is a function, call it; otherwise use it directly
      if (typeof tensorData === 'function') {
        embedding = Array.from(tensorData())
      } else if (Array.isArray(tensorData)) {
        embedding = tensorData.flat()
      } else {
        // Try to convert tensor data to array
        embedding = Array.from(tensorData as any)
      }
    } else if (Array.isArray(output)) {
      // If output is already an array
      embedding = output.flat()
    } else if (
      output &&
      typeof (output as any)[Symbol.iterator] === 'function'
    ) {
      // If output is iterable
      embedding = Array.from(output as any)
    } else {
      throw new Error(`Unexpected output format: ${typeof output}`)
    }

    // Ensure we have a valid number array
    if (!Array.isArray(embedding) || embedding.length === 0) {
      throw new Error(
        'Failed to extract embedding vector - empty or invalid array',
      )
    }

    // Convert to numbers and validate
    const numbers = embedding.map((v) => {
      const num = typeof v === 'number' ? v : parseFloat(String(v))
      if (isNaN(num)) {
        throw new Error(`Invalid number in embedding: ${v}`)
      }
      return num
    })

    return numbers
  } catch (error) {
    console.error('Error extracting embedding:', error)
    throw error
  }
}
