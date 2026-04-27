/**
 * Action Execution API Route
 * Executes autonomous agent actions (simulated for web demo)
 */

import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion, isApiKeyConfigured } from '@/lib/ai-client';

interface AgentAction {
  type: string;
  appName?: string;
  description: string;
  params?: Record<string, unknown>;
}

// Simulate action execution and provide feedback
export async function POST(req: NextRequest) {
  try {
    const { action, transcript, modelEngine = 'MODE_GLM' } = await req.json();

    if (!action) {
      return NextResponse.json({ error: 'Action required' }, { status: 400 });
    }

    const typedAction = action as AgentAction;

    // Simulate different actions
    let result: {
      success: boolean;
      message: string;
      analysis?: {
        riskLevel: string;
        summary: string;
        details: string;
        recommendations: string[];
        speakResponse: string;
      };
    };

    switch (typedAction.type) {
      case 'open_app':
        // In a real app, this would use Android bridge or AutoGLM-Phone
        result = {
          success: true,
          message: `已準備打開 ${typedAction.appName || '應用程式'}`,
          analysis: {
            riskLevel: 'INFO',
            summary: `正在為您打開 ${typedAction.appName}`,
            details: `已執行指令：打開 ${typedAction.appName || '應用程式'}。請在手機上確認。`,
            recommendations: [],
            speakResponse: `好的，正在幫你打開 ${typedAction.appName || '應用程式'}`
          }
        };
        break;

      case 'check_messages':
        // Analyze for scams
        if (isApiKeyConfigured(modelEngine)) {
          const analysisPrompt = `You are a fraud detection AI. Analyze this message for potential scams.
          
Message: "${transcript}"

Respond in Traditional Chinese (Cantonese) with JSON:
{
  "riskLevel": "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "summary": "brief summary",
  "details": "detailed explanation",
  "recommendations": ["action1", "action2"],
  "speakResponse": "elderly-friendly voice response"
}`;

          const aiResponse = await chatCompletion([
            { role: 'user', content: analysisPrompt }
          ], modelEngine);

          try {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const analysis = JSON.parse(jsonMatch[0]);
              result = {
                success: true,
                message: '訊息分析完成',
                analysis
              };
            } else {
              throw new Error('No JSON');
            }
          } catch {
            result = {
              success: true,
              message: '分析完成',
              analysis: {
                riskLevel: 'LOW',
                summary: aiResponse.substring(0, 150),
                details: aiResponse,
                recommendations: [],
                speakResponse: aiResponse.substring(0, 200)
              }
            };
          }
        } else {
          result = {
            success: false,
            message: 'API 未配置'
          };
        }
        break;

      case 'analyze_screen':
        result = {
          success: true,
          message: '截圖分析功能需要配合手機應用程式',
          analysis: {
            riskLevel: 'INFO',
            summary: '請使用手機應用程式進行截圖分析',
            details: '此功能需要 FraudGuard 手機應用程式支援。您可以下載我們的 Android 應用程式以使用此功能。',
            recommendations: ['下載 FraudGuard Android 應用程式', '或手動複製可疑訊息進行分析'],
            speakResponse: '截圖分析需要配合我哋嘅手機應用程式。您可以將可疑訊息複製過來，我幫您分析。'
          }
        };
        break;

      case 'make_call':
        const contact = typedAction.params?.contact || '聯絡人';
        result = {
          success: true,
          message: `正在撥打電話給 ${contact}`,
          analysis: {
            riskLevel: 'INFO',
            summary: `撥打電話給 ${contact}`,
            details: `已執行指令：撥打電話給 ${contact}。請在手機上確認。`,
            recommendations: [],
            speakResponse: `好的，正在幫你打俾 ${contact}`
          }
        };
        break;

      case 'send_message':
        result = {
          success: true,
          message: '訊息發送功能需要配合手機應用程式',
          analysis: {
            riskLevel: 'INFO',
            summary: '請使用手機應用程式發送訊息',
            details: '此功能需要 FraudGuard 手機應用程式支援。',
            recommendations: [],
            speakResponse: '發送訊息需要配合手機應用程式。'
          }
        };
        break;

      case 'search_web':
        result = {
          success: true,
          message: '網絡搜尋功能需要配合搜尋服務',
          analysis: {
            riskLevel: 'INFO',
            summary: '搜尋功能開發中',
            details: '網絡搜尋功能即將推出。',
            recommendations: [],
            speakResponse: '搜尋功能正在開發中，請稍後再試。'
          }
        };
        break;

      case 'none':
      default:
        result = {
          success: true,
          message: '無需執行動作'
        };
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Action execution error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Action failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'FraudGuard HK Action Executor',
    note: 'This is a simulated execution. Real implementation requires AutoGLM-Phone or native app bridge.',
    actions: {
      open_app: 'Opens specified app (requires native bridge)',
      check_messages: 'Analyzes messages for fraud',
      analyze_screen: 'Takes screenshot and analyzes (requires native bridge)',
      make_call: 'Makes phone call (requires native bridge)',
      send_message: 'Sends message (requires native bridge)',
      search_web: 'Searches web (requires search API)'
    }
  });
}
