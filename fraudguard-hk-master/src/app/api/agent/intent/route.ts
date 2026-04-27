/**
 * Intent Parser API Route
 * Parses user intent for autonomous agent actions
 */

import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion, isApiKeyConfigured } from '@/lib/ai-client';

// Action types the agent can perform
type ActionType = 'open_app' | 'check_messages' | 'analyze_screen' | 'make_call' | 'send_message' | 'search_web' | 'none';

interface AgentAction {
  type: ActionType;
  appName?: string;
  description: string;
  params?: Record<string, unknown>;
}

interface ParsedIntent {
  intent: string;
  action: AgentAction;
  confidence: number;
  requiresConfirmation: boolean;
  speakResponse: string;
}

// System prompt for intent parsing
const INTENT_SYSTEM_PROMPT = `You are an autonomous phone assistant for elderly users in Hong Kong. Parse the user's request and determine what action to take.

Available actions:
- open_app: Open a specific app (WhatsApp, WeChat, Messages, Phone, etc.)
- check_messages: Check recent messages for scams  
- analyze_screen: Take a screenshot and analyze it for fraud
- make_call: Make a phone call to someone
- send_message: Send a message to someone
- search_web: Search the web for information
- none: No action needed, just analyze and respond

IMPORTANT: Respond in Traditional Chinese (Cantonese) for Hong Kong users. Keep responses simple and elderly-friendly.

Respond ONLY with valid JSON in this exact format:
{
  "intent": "brief description of what user wants",
  "action": {
    "type": "action_type_here",
    "appName": "app_name_if_opening_app",
    "description": "what will happen in simple terms",
    "params": {}
  },
  "confidence": 0.0_to_1.0,
  "requiresConfirmation": true_or_false,
  "speakResponse": "what to say to the user in Cantonese"
}

Examples:
User: "打開 WhatsApp" -> type: "open_app", appName: "WhatsApp", description: "正在為您打開 WhatsApp"
User: "幫我檢查訊息有無詐騙" -> type: "check_messages", description: "正在檢查您的訊息"
User: "打俾媽咪" -> type: "make_call", params: {"contact": "媽咪"}, description: "正在撥打電話給媽咪"
User: "呢個訊息係咪詐騙？有人叫我轉錢" -> type: "none", speakResponse: analysis of the message
User: "截圖分析" -> type: "analyze_screen", description: "正在截圖並分析"
User: "幫我搵下呢個電話號碼" -> type: "search_web", params: {"query": "phone number lookup"}`;

export async function POST(req: NextRequest) {
  try {
    const { message, modelEngine = 'MODE_GLM', language = 'zh-HK' } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    if (!isApiKeyConfigured(modelEngine)) {
      const envVar = modelEngine === 'MODE_QWEN' ? 'DASHSCOPE_API_KEY' : 'BIGMODEL_API_KEY';
      return NextResponse.json({
        plan: {
          intent: 'Configuration needed',
          action: { type: 'none', description: 'API key not configured' },
          confidence: 0,
          requiresConfirmation: false,
          speakResponse: `請先設定 ${envVar}`
        }
      });
    }

    // Get intent from AI
    const response = await chatCompletion([
      { role: 'system', content: INTENT_SYSTEM_PROMPT },
      { role: 'user', content: message }
    ], modelEngine);

    // Parse JSON response
    let plan: ParsedIntent;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        plan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      // Fallback: treat as regular analysis
      plan = {
        intent: message,
        action: { type: 'none', description: 'Analyze only' },
        confidence: 0.5,
        requiresConfirmation: false,
        speakResponse: response
      };
    }

    return NextResponse.json({ plan });

  } catch (error) {
    console.error('Intent parsing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Intent parsing failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'FraudGuard HK Intent Parser',
    actions: ['open_app', 'check_messages', 'analyze_screen', 'make_call', 'send_message', 'search_web', 'none']
  });
}
