/**
 * Chat/LLM API Route for FraudGuard HK
 * Handles text-based fraud detection and conversation
 */

import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion, isApiKeyConfigured } from '@/lib/ai-client';

// Fraud detection system prompt - CONCISE OUTPUT
const FRAUD_SYSTEM_PROMPT = `You are FraudGuard HK, an AI fraud detection assistant for Hong Kong elderly users.

CRITICAL: Keep ALL responses BRIEF and CONCISE. Maximum 2-3 short sentences. No lengthy explanations.

Respond in Traditional Chinese (Cantonese) for Hong Kong users.

When analyzing content, identify:
- Urgency language ("立即", "緊急", "限時")
- Requests for money or personal info
- Suspicious links
- Impersonation attempts
- Too-good-to-be-true offers

Always respond with valid JSON (keep ALL fields SHORT):
{
  "riskLevel": "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "summary": "ONE sentence max - what is suspicious",
  "details": "TWO sentences max - brief explanation",
  "recommendations": ["ONE action only"],
  "speakResponse": "ONE short sentence for voice output"
}

REMEMBER: Less is more. Elderly users need clear, quick answers, not detailed reports.`;

export async function POST(req: NextRequest) {
  try {
    const { 
      message, 
      mode = 'ELDERLY',
      modelEngine = 'MODE_GLM',
      language = 'zh-HK',
      history = []
    } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Check API key
    if (!isApiKeyConfigured(modelEngine)) {
      const envVar = modelEngine === 'MODE_QWEN' ? 'DASHSCOPE_API_KEY' : 'BIGMODEL_API_KEY';
      return NextResponse.json({ 
        success: false, 
        error: `Please configure ${envVar} in .env file` 
      }, { status: 500 });
    }

    // Build mode-specific system prompt
    const modeInstructions = mode === 'ELDERLY'
      ? `\n\nELDERLY MODE - Ultra concise:
1. Maximum 10 words per response
2. Clear SAFE/NOT SAFE answer first
3. ONE action to take
4. No technical terms`
      : `\n\nDEFAULT MODE - Still brief but can include 1-2 more details if needed.`;

    const systemPrompt = FRAUD_SYSTEM_PROMPT + modeInstructions + `\n\nUser language preference: ${language}`;

    // Build messages array
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt }
    ];

    // Add history (limited)
    const recentHistory = history.slice(-6);
    for (const msg of recentHistory) {
      messages.push({ role: msg.role, content: msg.content });
    }

    // Add current message
    messages.push({ role: 'user', content: message });

    // Get AI response
    const response = await chatCompletion(messages, modelEngine);

    // Parse analysis
    const analysis = parseAnalysisResponse(response, mode);

    return NextResponse.json({
      success: true,
      analysis,
      modelUsed: modelEngine,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

function parseAnalysisResponse(response: string, mode: string) {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        riskLevel: parsed.riskLevel || 'UNKNOWN',
        summary: parsed.summary || 'Analysis completed',
        details: parsed.details || response,
        recommendations: parsed.recommendations || [],
        speakResponse: parsed.speakResponse || parsed.summary || response
      };
    }
  } catch {
    console.warn('Failed to parse JSON response');
  }

  // Fallback: Generate structured response
  return generateFallbackAnalysis(response, mode);
}

function generateFallbackAnalysis(response: string, mode: string) {
  const lower = response.toLowerCase();
  let riskLevel = 'LOW';

  if (lower.includes('critical') || lower.includes('詐騙') || lower.includes('scam') || lower.includes('危險')) {
    riskLevel = 'CRITICAL';
  } else if (lower.includes('high') || lower.includes('可疑') || lower.includes('suspicious') || lower.includes('警告')) {
    riskLevel = 'HIGH';
  } else if (lower.includes('medium') || lower.includes('注意') || lower.includes('caution')) {
    riskLevel = 'MEDIUM';
  } else if (lower.includes('safe') || lower.includes('安全') || lower.includes('legitimate')) {
    riskLevel = 'SAFE';
  }

  let speakResponse = response;
  if (mode === 'ELDERLY') {
    if (riskLevel === 'SAFE') {
      speakResponse = '呢個睇落安全，冇發現問題。';
    } else if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
      speakResponse = `警告！呢個好可疑。${response.substring(0, 100)}。千祈唔好回覆或者俾錢！`;
    } else {
      speakResponse = `要小心。${response.substring(0, 100)}`;
    }
  }

  return {
    riskLevel,
    summary: response.substring(0, 150),
    details: response,
    recommendations: [],
    speakResponse
  };
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'FraudGuard HK Chat API',
    modes: ['ELDERLY', 'DEFAULT'],
    languages: ['en', 'zh-HK', 'zh-CN']
  });
}
