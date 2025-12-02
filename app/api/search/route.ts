import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/embeddings';
import { searchSimilarScenarios } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { query } = body;

        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return NextResponse.json(
                { error: 'Query parameter is required and must be a non-empty string' },
                { status: 400 }
            );
        }

        // Generate embedding for the user query
        const queryEmbedding = await generateEmbedding(query.trim());

        // Search for similar scenarios
        const results = await searchSimilarScenarios(queryEmbedding, 5);

        return NextResponse.json({ results });
    } catch (error) {
        console.error('Error in search API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
