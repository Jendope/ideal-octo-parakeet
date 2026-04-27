/**
 * ASR (Speech-to-Text) API Route
 * Using Qwen3 ASR for Qwen mode
 */

import { NextRequest, NextResponse } from 'next/server';
import { speechToText, isApiKeyConfigured } from '@/lib/ai-client';

export async function POST(req: NextRequest) {
  try {
    const { audioData, modelEngine = 'MODE_GLM' } = await req.json();

    if (!audioData) {
      return NextResponse.json({ error: 'Audio data required' }, { status: 400 });
    }

    // Check API key for selected engine
    if (!isApiKeyConfigured(modelEngine)) {
      const envVar = modelEngine === 'MODE_QWEN' ? 'DASHSCOPE_API_KEY' : 'BIGMODEL_API_KEY';
      return NextResponse.json({ 
        success: false, 
        error: `Please configure ${envVar} in .env file` 
      }, { status: 500 });
    }

    // Extract base64 from data URL if needed
    let base64 = audioData;
    if (audioData.startsWith('data:audio')) {
      const match = audioData.match(/^data:audio\/\w+;base64,(.+)$/);
      if (match?.[1]) base64 = match[1];
    }

    // Use Qwen ASR
    const transcription = await speechToText(base64, modelEngine);

    return NextResponse.json({
      success: true,
      transcription: transcription.trim(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('ASR Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'ASR failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'FraudGuard HK ASR API',
    models: {
      qwen: 'qwen3-asr-flash-2026-02-10',
      glm: 'glm-4-flash (fallback)'
    },
    formats: ['wav', 'mp3', 'm4a', 'flac']
  });
}
