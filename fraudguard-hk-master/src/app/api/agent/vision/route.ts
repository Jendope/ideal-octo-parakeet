/**
 * Vision/VLM API Route for SafeGuard Agent
 * Handles image-based fraud detection analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { agentOrchestrator } from '@/lib/agent-orchestrator';
import { ModelEngine, UserMode } from '@/lib/app-config';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const { 
      message = 'Analyze this image for potential fraud or scams',
      imageData,
      mode = 'ELDERLY',
      modelEngine = 'MODE_GLM'
    } = body;

    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required (base64 encoded)' },
        { status: 400 }
      );
    }

    // Validate base64 format
    let base64Data = imageData;
    if (imageData.startsWith('data:image')) {
      // Extract base64 part from data URL
      const matches = imageData.match(/^data:image\/\w+;base64,(.+)$/);
      if (matches && matches[1]) {
        base64Data = imageData; // Keep full data URL for the API
      }
    }

    // Set model engine
    agentOrchestrator.setModelEngine(modelEngine as ModelEngine);

    // Process the vision request
    const response = await agentOrchestrator.processCommand({
      content: message,
      imageData: base64Data,
      mode: mode as UserMode
    });

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to analyze image' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis: response.analysis,
      modelUsed: modelEngine,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Vision API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'SafeGuard Agent Vision API',
    description: 'POST to this endpoint with { imageData (base64), message, mode, modelEngine } to analyze images for fraud'
  });
}
