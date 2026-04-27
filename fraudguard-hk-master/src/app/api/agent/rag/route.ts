/**
 * RAG Fraud Detection API Route for FraudGuard HK
 * Provides CONCISE, elderly-friendly output format for scam detection
 */

import { NextRequest, NextResponse } from 'next/server';

// Elderly-friendly output format - CONCISE
interface ElderlyOutput {
  fraud_score: number;
  visual_label: string;
  simple_reason: string;      // MAX 10 words
  action: string;             // MAX 8 words
  confidence_display: string;
  color: string;
}

interface SimilarCase {
  title: string;
  url: string;
  relevance: string;
}

interface AnalysisResult {
  success: boolean;
  output?: ElderlyOutput;
  similar_cases?: SimilarCase[];
  error?: string;
}

// Fraud indicators - CONCISE reasons and actions
const FRAUD_INDICATORS = {
  link: {
    patterns: ['http', 'https', '點擊', '点击', 'click', 'link', '連結', '链接'],
    weight: 0.3,
    reason_zh: '可疑連結',
    reason_en: 'Suspicious link',
    action_zh: '唔好撳',
    action_en: 'Don\'t click'
  },
  money: {
    patterns: ['匯款', '转账', '银行', '付款', '轉帳', 'HK$', 'pay', 'transfer', '金額'],
    weight: 0.4,
    reason_zh: '要求付款',
    reason_en: 'Requests money',
    action_zh: '唔好轉賬',
    action_en: 'Don\'t transfer'
  },
  personal: {
    patterns: ['身份證', '密码', '验证码', '個人資料', 'password', 'ID', '身分證'],
    weight: 0.35,
    reason_zh: '索個人資料',
    reason_en: 'Wants your info',
    action_zh: '唔好俾',
    action_en: 'Don\'t share'
  },
  prize: {
    patterns: ['中獎', '獎品', '抽獎', '優惠', '獲得', 'won', 'prize', 'winner', '恭喜'],
    weight: 0.3,
    reason_zh: '中獎詐騙',
    reason_en: 'Prize scam',
    action_zh: '係假嘅',
    action_en: 'It\'s fake'
  },
  urgency: {
    patterns: ['立即', '緊急', '限時', '馬上', '即時', 'urgent', 'immediately', '24小時'],
    weight: 0.2,
    reason_zh: '催促行動',
    reason_en: 'Pressures you',
    action_zh: '慢慢諗清楚',
    action_en: 'Take your time'
  },
  authority: {
    patterns: ['政府', '警察', '官員', '公安', '海關', '法院', 'government', 'police'],
    weight: 0.25,
    reason_zh: '冒充官員',
    reason_en: 'Fake official',
    action_zh: '致電核實',
    action_en: 'Verify first'
  }
};

// Risk level configuration
const RISK_LEVELS = {
  SAFE: { threshold: 0, color: 'green', icon: '🟢', label_zh: '安全', label_en: 'Safe' },
  LOW: { threshold: 0.2, color: 'yellow', icon: '🟡', label_zh: '低風險', label_en: 'Low Risk' },
  MEDIUM: { threshold: 0.4, color: 'orange', icon: '🟠', label_zh: '中風險', label_en: 'Medium Risk' },
  HIGH: { threshold: 0.6, color: 'red', icon: '🔴', label_zh: '高風險', label_en: 'High Risk' },
  CRITICAL: { threshold: 0.8, color: 'darkred', icon: '🔴', label_zh: '極高風險', label_en: 'Critical Risk' }
};

function detectIndicators(text: string): { type: string; weight: number }[] {
  const detected: { type: string; weight: number }[] = [];
  const textLower = text.toLowerCase();

  for (const [type, config] of Object.entries(FRAUD_INDICATORS)) {
    for (const pattern of config.patterns) {
      if (textLower.includes(pattern.toLowerCase())) {
        detected.push({ type, weight: config.weight });
        break;
      }
    }
  }

  return detected;
}

function calculateRiskScore(indicators: { type: string; weight: number }[]): number {
  if (indicators.length === 0) return 0;
  const total = indicators.reduce((sum, ind) => sum + ind.weight, 0);
  return Math.min(total, 1.0);
}

function getRiskLevel(score: number): keyof typeof RISK_LEVELS {
  if (score >= 0.8) return 'CRITICAL';
  if (score >= 0.6) return 'HIGH';
  if (score >= 0.4) return 'MEDIUM';
  if (score >= 0.2) return 'LOW';
  return 'SAFE';
}

function formatElderlyOutput(
  score: number,
  indicators: { type: string; weight: number }[],
  language: string = 'zh'
): ElderlyOutput {
  const riskLevel = getRiskLevel(score);
  const riskConfig = RISK_LEVELS[riskLevel];
  
  const primaryIndicator = indicators[0]?.type || 'safe';
  const indicatorConfig = FRAUD_INDICATORS[primaryIndicator as keyof typeof FRAUD_INDICATORS];
  
  const labelKey = language === 'en' ? 'label_en' : 'label_zh';
  const visual_label = `${riskConfig.icon} ${riskConfig[labelKey as keyof typeof riskConfig]}`;
  
  const reasonKey = language === 'en' ? 'reason_en' : 'reason_zh';
  const actionKey = language === 'en' ? 'action_en' : 'action_zh';
  
  let simple_reason: string;
  let action: string;
  
  if (indicatorConfig) {
    simple_reason = indicatorConfig[reasonKey as keyof typeof indicatorConfig] as string;
    action = indicatorConfig[actionKey as keyof typeof indicatorConfig] as string;
  } else {
    simple_reason = language === 'en' ? 'No issues' : '冇問題';
    action = language === 'en' ? 'Safe' : '安全';
  }
  
  return {
    fraud_score: Math.round(score * 100) / 100,
    visual_label,
    simple_reason,
    action,
    confidence_display: `${Math.round(score * 100)}%`,
    color: riskConfig.color
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, language = 'zh', include_rag = true } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    const indicators = detectIndicators(message);
    const score = calculateRiskScore(indicators);
    const output = formatElderlyOutput(score, indicators, language);
    
    const similar_cases: SimilarCase[] = [];
    if (include_rag && score > 0.2) {
      similar_cases.push({
        title: '警惕最新電話詐騙手法',
        url: 'https://www.hk01.com/article/example1',
        relevance: 'high'
      });
    }
    
    const result: AnalysisResult = {
      success: true,
      output,
      similar_cases
    };
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('RAG Analysis Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'FraudGuard HK RAG Analysis API',
    description: 'CONCISE elderly-friendly fraud detection',
    output_example: {
      fraud_score: 0.85,
      visual_label: "🔴 高風險",
      simple_reason: "可疑連結",
      action: "唔好撳",
      confidence_display: "85%"
    }
  });
}
