/**
 * AutoGLM-Phone API Route
 * Integrates with AutoGLM-Phone via BigModel API for autonomous phone control
 * 
 * Model: autoglm-phone
 * Endpoint: https://open.bigmodel.cn/api/paas/v4
 * 
 * Usage:
 * - Analyze screenshots for UI elements
 * - Execute autonomous phone actions
 * - Parse voice commands into actionable steps
 */

import { NextRequest, NextResponse } from 'next/server';
import { visionCompletion, isApiKeyConfigured, chatCompletion } from '@/lib/ai-client';

interface AutoGLMRequest {
  imageData?: string;
  instruction: string;
  action?: 'analyze' | 'execute' | 'plan';
  language?: string;
}

interface PhoneAction {
  type: 'tap' | 'swipe' | 'type' | 'scroll' | 'open_app' | 'wait' | 'none';
  coordinates?: { x: number; y: number };
  text?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  appName?: string;
  description: string;
}

// System prompt for AutoGLM-Phone
const AUTOGLM_SYSTEM_PROMPT = `You are AutoGLM-Phone, an AI assistant that helps elderly users control their phones through voice commands.

You can analyze screenshots and execute actions on the phone UI. Respond in Traditional Chinese (zh-HK) by default, or in the user's preferred language.

Available actions:
- tap: Tap on a specific UI element
- swipe: Swipe in a direction (up/down/left/right)
- type: Type text into a text field
- scroll: Scroll in a direction
- open_app: Open a specific app
- wait: Wait for something to load
- none: No action needed

When analyzing screenshots or voice commands, respond with a JSON plan:
{
  "understanding": "What the user wants to do",
  "action": {
    "type": "action_type",
    "coordinates": {"x": 0, "y": 0},
    "text": "text to type",
    "direction": "up/down/left/right",
    "appName": "app name",
    "description": "Human-readable description"
  },
  "speakResponse": "What to say to the user in their language",
  "requiresConfirmation": true/false
}

Important for elderly users:
- Keep responses simple and clear
- Always confirm before executing potentially harmful actions
- Provide spoken feedback in Cantonese for HK users
- Detect scams and warn users proactively`;

export async function POST(req: NextRequest) {
  try {
    const { imageData, instruction, action = 'analyze', language = 'zh-HK' } = await req.json() as AutoGLMRequest;

    if (!instruction) {
      return NextResponse.json({ error: 'Instruction required' }, { status: 400 });
    }

    // Check if BigModel API key is configured
    if (!isApiKeyConfigured('MODE_GLM')) {
      return NextResponse.json({
        success: false,
        error: 'AutoGLM-Phone requires BIGMODEL_API_KEY. Please configure it in .env file.',
        note: 'AutoGLM-Phone model: autoglm-phone via BigModel API'
      });
    }

    // If we have an image, use vision model for screen analysis
    if (imageData) {
      try {
        const visionResponse = await visionCompletion(
          `${AUTOGLM_SYSTEM_PROMPT}\n\nUser request: ${instruction}\nLanguage: ${language}`,
          imageData,
          'MODE_GLM'
        );
        
        // Parse the response into an action plan
        const plan = parseActionFromText(visionResponse, language);
        
        return NextResponse.json({
          success: true,
          plan,
          rawResponse: visionResponse,
          model: 'glm-4.6v (AutoGLM-Phone capability)'
        });
      } catch (visionError) {
        console.error('Vision API error:', visionError);
        return NextResponse.json({
          success: false,
          error: 'Failed to analyze screenshot',
          details: visionError instanceof Error ? visionError.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    // Text-only request - parse intent for phone actions
    const chatResponse = await chatCompletion([
      { role: 'system', content: AUTOGLM_SYSTEM_PROMPT },
      { role: 'user', content: `Parse this voice command into a phone action. Language: ${language}\n\nCommand: "${instruction}"` }
    ], 'MODE_GLM');

    const plan = parseActionFromText(chatResponse, language);

    return NextResponse.json({
      success: true,
      plan,
      rawResponse: chatResponse,
      model: 'glm-4-flash'
    });

  } catch (error) {
    console.error('AutoGLM-Phone error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'AutoGLM request failed' },
      { status: 500 }
    );
  }
}

// Parse action from text response
function parseActionFromText(text: string, language: string): {
  understanding: string;
  action: PhoneAction;
  speakResponse: string;
  requiresConfirmation: boolean;
} {
  // Try to extract JSON from response
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        understanding: parsed.understanding || 'Processing request',
        action: parsed.action || { type: 'none', description: 'No action' },
        speakResponse: parsed.speakResponse || text.substring(0, 200),
        requiresConfirmation: parsed.requiresConfirmation ?? true
      };
    }
  } catch {
    // JSON parsing failed, continue with text parsing
  }

  // Parse action type from text
  const lowerText = text.toLowerCase();
  let actionType: PhoneAction['type'] = 'none';
  let appName = '';
  let description = '';

  // Multi-language action detection
  if (lowerText.includes('open') || text.includes('打開') || text.includes('打开') || text.includes('启动')) {
    actionType = 'open_app';
    // Try to extract app name
    const appPatterns = [
      /open\s+(\w+)/i,
      /打開\s*(\S+)/,
      /打开\s*(\S+)/,
      /启动\s*(\S+)/,
    ];
    for (const pattern of appPatterns) {
      const match = text.match(pattern);
      if (match) {
        appName = match[1];
        description = language === 'en' ? `Open ${appName}` : 
                      language === 'zh-CN' ? `打开 ${appName}` : 
                      `打開 ${appName}`;
        break;
      }
    }
  } else if (lowerText.includes('tap') || text.includes('點擊') || text.includes('点击')) {
    actionType = 'tap';
    description = language === 'en' ? 'Tap on screen' : 
                  language === 'zh-CN' ? '点击屏幕' : 
                  '點擊屏幕';
  } else if (lowerText.includes('swipe') || text.includes('滑動') || text.includes('滑动')) {
    actionType = 'swipe';
    description = language === 'en' ? 'Swipe on screen' : 
                  language === 'zh-CN' ? '滑动屏幕' : 
                  '滑動屏幕';
  } else if (lowerText.includes('type') || text.includes('輸入') || text.includes('输入')) {
    actionType = 'type';
    description = language === 'en' ? 'Type text' : 
                  language === 'zh-CN' ? '输入文字' : 
                  '輸入文字';
  } else if (lowerText.includes('scroll') || text.includes('滾動') || text.includes('滚动')) {
    actionType = 'scroll';
    description = language === 'en' ? 'Scroll screen' : 
                  language === 'zh-CN' ? '滚动屏幕' : 
                  '滾動屏幕';
  }

  return {
    understanding: language === 'en' ? 'Voice command parsed' : 
                    language === 'zh-CN' ? '语音命令已解析' : 
                    '語音命令已解析',
    action: {
      type: actionType,
      appName,
      description: description || (language === 'en' ? 'Processing command' : 
                                     language === 'zh-CN' ? '处理命令中' : 
                                     '處理命令中')
    },
    speakResponse: text.substring(0, 300),
    requiresConfirmation: actionType !== 'none'
  };
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'AutoGLM-Phone API',
    model: 'autoglm-phone',
    provider: 'BigModel (智谱)',
    documentation: 'https://docs.bigmodel.cn/cn/api/introduction',
    usage: {
      analyze: 'Analyze screenshot for UI elements and actions',
      execute: 'Execute a phone action',
      plan: 'Plan actions based on voice command'
    },
    actions: ['tap', 'swipe', 'type', 'scroll', 'open_app', 'wait', 'none'],
    note: 'Requires BIGMODEL_API_KEY in .env file'
  });
}
