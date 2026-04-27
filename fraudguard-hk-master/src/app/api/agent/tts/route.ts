/**
 * TTS (Text-to-Speech) API Route
 * Uses DashScope for Chinese TTS
 */

import { NextRequest, NextResponse } from 'next/server';
import { textToSpeech, isApiKeyConfigured } from '@/lib/ai-client';

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'tongtong', speed = 0.9, modelEngine = 'MODE_GLM' } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }

    // Limit text length
    const textToProcess = text.length > 1000 ? text.substring(0, 1000) + '...' : text;

    // Check DashScope API key for TTS
    const ttsKey = process.env.DASHSCOPE_API_KEY;
    if (!ttsKey || ttsKey === 'your_dashscope_api_key_here') {
      return NextResponse.json({ 
        error: 'DASHSCOPE_API_KEY required for Text-to-Speech. Please add it to .env file.' 
      }, { status: 500 });
    }

    const audioBuffer = await textToSpeech(textToProcess, { voice, speed, modelEngine });
    const buffer = Buffer.from(audioBuffer);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'TTS failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'FraudGuard HK TTS API',
    voices: ['tongtong', 'chuichui', 'xiaochen', 'wanwan', 'stella', 'anna'],
    speedRange: '0.5 - 2.0',
    maxTextLength: 1000
  });
}
