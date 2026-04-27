/**
 * Configuration API Route for SafeGuard Agent
 * Manages app configuration and model switching
 */

import { NextRequest, NextResponse } from 'next/server';
import { MODEL_CONFIGS, ModelEngine } from '@/lib/app-config';

export async function GET() {
  return NextResponse.json({
    models: MODEL_CONFIGS,
    defaultModel: 'MODE_GLM',
    description: 'SafeGuard Agent Configuration'
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, modelEngine, userMode } = body;

    if (action === 'switch_model' && modelEngine) {
      if (modelEngine !== 'MODE_QWEN' && modelEngine !== 'MODE_GLM') {
        return NextResponse.json(
          { error: 'Invalid model engine. Use MODE_QWEN or MODE_GLM' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Model switched to ${modelEngine}`,
        currentModel: MODEL_CONFIGS[modelEngine as ModelEngine]
      });
    }

    if (action === 'switch_mode' && userMode) {
      if (userMode !== 'ELDERLY' && userMode !== 'DEFAULT') {
        return NextResponse.json(
          { error: 'Invalid user mode. Use ELDERLY or DEFAULT' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Mode switched to ${userMode}`,
        currentMode: userMode
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use switch_model or switch_mode' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Config API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
