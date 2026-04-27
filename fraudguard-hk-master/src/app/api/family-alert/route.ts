/**
 * Family Alert API
 * Sends alerts to family members when fraud is detected
 * Supports multiple languages: English, Traditional Chinese (HK), Simplified Chinese (CN)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Language } from '@/lib/i18n/translations';

interface AlertRequest {
  riskLevel: string;
  message: string;
  summary?: string;
  contactIds?: string[];  // If not provided, alert all active contacts
  language?: Language;    // Language for alert message
}

// Multi-language alert message templates
const ALERT_MESSAGES: Record<Language, {
  title: (risk: string) => string;
  warning: string;
  content: (msg: string, summary?: string) => string;
  advice: string[];
  hotline: string;
  footer: string;
}> = {
  'zh-HK': {
    title: (risk) => `${risk === 'critical' ? '🚨' : '⚠️'} 【防詐衛士警示】${risk === 'critical' ? '高危' : '高風險'}詐騙偵測`,
    warning: '您的家人可能收到可疑訊息：',
    content: (msg, summary) => `"${msg.substring(0, 200)}${msg.length > 200 ? '...' : ''}"\n\n${summary ? `分析：${summary}` : ''}`,
    advice: [
      '不要轉賬或提供個人資料',
      '不要點擊任何連結',
      '如有疑問，致電反詐騙協調中心'
    ],
    hotline: '📞 香港警務處反詐騙協調中心：18222',
    footer: '此訊息由 FraudGuard HK 自動發送'
  },
  'zh-CN': {
    title: (risk) => `${risk === 'critical' ? '🚨' : '⚠️'} 【防骗卫士警示】${risk === 'critical' ? '高危' : '高风险'}诈骗检测`,
    warning: '您的家人可能收到可疑消息：',
    content: (msg, summary) => `"${msg.substring(0, 200)}${msg.length > 200 ? '...' : ''}"\n\n${summary ? `分析：${summary}` : ''}`,
    advice: [
      '不要转账或提供个人资料',
      '不要点击任何链接',
      '如有疑问，致电反诈骗协调中心'
    ],
    hotline: '📞 香港警务处反诈骗协调中心：18222',
    footer: '此消息由 FraudGuard HK 自动发送'
  },
  'en': {
    title: (risk) => `${risk === 'critical' ? '🚨' : '⚠️'} [FraudGuard Alert] ${risk === 'critical' ? 'Critical' : 'High'} Risk Scam Detected`,
    warning: 'Your family member may have received a suspicious message:',
    content: (msg, summary) => `"${msg.substring(0, 200)}${msg.length > 200 ? '...' : ''}"\n\n${summary ? `Analysis: ${summary}` : ''}`,
    advice: [
      'Do NOT transfer money or provide personal information',
      'Do NOT click any links',
      'If in doubt, call the Anti-Deception Coordination Centre'
    ],
    hotline: '📞 HK Police Anti-Deception Coordination Centre: 18222',
    footer: 'This message was automatically sent by FraudGuard HK'
  }
};

// Generate alert message for family member
function generateAlertMessage(riskLevel: string, suspiciousMessage: string, summary: string | undefined, language: Language): string {
  const templates = ALERT_MESSAGES[language] || ALERT_MESSAGES['zh-HK'];
  
  const lines = [
    templates.title(riskLevel),
    '',
    templates.warning,
    '',
    templates.content(suspiciousMessage, summary),
    '',
    language === 'en' 
      ? 'Please contact your family member immediately and remind them:'
      : language === 'zh-CN'
        ? '请尽快联系您的家人确认情况，并提醒他们：'
        : '請盡快聯絡您的家人確認情況，並提醒他們：',
    ...templates.advice.map((a, i) => `${i + 1}. ${a}`),
    '',
    templates.hotline,
    '',
    templates.footer
  ];
  
  return lines.join('\n');
}

// GET - List alert history
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const alerts = await db.familyAlert.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { contact: true }
    });
    
    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Failed to fetch alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

// POST - Send family alert
export async function POST(req: NextRequest) {
  try {
    const { riskLevel, message, summary, contactIds, language = 'zh-HK' } = await req.json() as AlertRequest;
    
    if (!riskLevel || !message) {
      return NextResponse.json(
        { error: 'Risk level and message are required' },
        { status: 400 }
      );
    }
    
    // Only send alerts for high or critical risk
    if (riskLevel.toLowerCase() !== 'high' && riskLevel.toLowerCase() !== 'critical') {
      return NextResponse.json({
        success: false,
        message: 'Alerts are only sent for high or critical risk'
      });
    }
    
    // Get contacts to alert
    const contacts = contactIds && contactIds.length > 0
      ? await db.emergencyContact.findMany({
          where: { id: { in: contactIds }, isActive: true }
        })
      : await db.emergencyContact.findMany({
          where: { isActive: true },
          orderBy: { priority: 'asc' }
        });
    
    if (contacts.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No emergency contacts configured'
      });
    }
    
    const alertMessage = generateAlertMessage(riskLevel, message, summary, language);
    const results = [];
    
    // Create alert records and generate share links
    for (const contact of contacts) {
      // Create alert record
      const alert = await db.familyAlert.create({
        data: {
          riskLevel,
          message,
          summary,
          contactId: contact.id,
          platform: contact.platform,
          status: 'pending'
        }
      });
      
      // Generate share link based on platform
      let shareUrl = '';
      const encodedMessage = encodeURIComponent(alertMessage);
      const phone = contact.phone.replace(/\D/g, ''); // Remove non-digits
      
      switch (contact.platform) {
        case 'whatsapp':
          // WhatsApp share URL
          shareUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
          break;
        case 'wechat':
          // WeChat doesn't support URL scheme for direct messaging
          // User needs to copy message and share manually
          shareUrl = 'wechat://';
          break;
        case 'sms':
          shareUrl = `sms:${phone}?body=${encodedMessage}`;
          break;
        default:
          shareUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
      }
      
      results.push({
        alertId: alert.id,
        contact: {
          id: contact.id,
          name: contact.name,
          phone: contact.phone,
          platform: contact.platform
        },
        shareUrl,
        message: alertMessage
      });
      
      // Update alert status
      await db.familyAlert.update({
        where: { id: alert.id },
        data: { status: 'sent', sentAt: new Date() }
      });
    }
    
    return NextResponse.json({
      success: true,
      message: `Alert prepared for ${results.length} contact(s)`,
      alertMessage,
      results
    });
    
  } catch (error) {
    console.error('Failed to send alert:', error);
    return NextResponse.json(
      { error: 'Failed to send alert' },
      { status: 500 }
    );
  }
}

// PUT - Update alert status (for tracking delivery)
export async function PUT(req: NextRequest) {
  try {
    const { id, status, error } = await req.json();
    
    if (!id || !status) {
      return NextResponse.json(
        { error: 'Alert ID and status are required' },
        { status: 400 }
      );
    }
    
    const alert = await db.familyAlert.update({
      where: { id },
      data: {
        status,
        error,
        sentAt: status === 'delivered' ? new Date() : undefined
      }
    });
    
    return NextResponse.json({ alert });
  } catch (error) {
    console.error('Failed to update alert:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}
