/**
 * AgentOrchestrator - The Logic Center for FraudGuard HK
 * Coordinates between LLM, VLM, TTS, and ASR services
 * Uses direct API calls - no external SDK required
 */

import { ModelEngine, UserMode, MODEL_CONFIGS, FRAUD_DETECTION_SYSTEM_PROMPT, AgentResponse } from './app-config';
import { chatCompletion, visionCompletion, isApiKeyConfigured, MODEL_INFO } from './ai-client';

// Conversation Message Type
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// Analysis Request Type
export interface AnalysisRequest {
  content: string;
  imageData?: string;
  mode: UserMode;
  conversationHistory?: ConversationMessage[];
}

// Orchestrator Configuration
interface OrchestratorConfig {
  modelEngine: ModelEngine;
  maxHistoryLength: number;
}

// Default: ELDERLY mode for Hong Kong users
const DEFAULT_CONFIG: OrchestratorConfig = {
  modelEngine: 'MODE_GLM',
  maxHistoryLength: 10  // Reduced for better performance
};

// Agent Orchestrator Class
export class AgentOrchestrator {
  private static instance: AgentOrchestrator;
  private config: OrchestratorConfig;
  private conversationHistory: ConversationMessage[];

  private constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.conversationHistory = [];
  }

  public static getInstance(): AgentOrchestrator {
    if (!AgentOrchestrator.instance) {
      AgentOrchestrator.instance = new AgentOrchestrator();
    }
    return AgentOrchestrator.instance;
  }

  // Set Model Engine
  public setModelEngine(engine: ModelEngine): void {
    this.config.modelEngine = engine;
  }

  public getModelEngine(): ModelEngine {
    return this.config.modelEngine;
  }

  public getCurrentModelConfig() {
    return MODEL_CONFIGS[this.config.modelEngine];
  }

  // Process User Command
  public async processCommand(request: AnalysisRequest): Promise<AgentResponse> {
    try {
      // Check API key first
      if (!isApiKeyConfigured(this.config.modelEngine)) {
        const envVar = this.config.modelEngine === 'MODE_QWEN' ? 'DASHSCOPE_API_KEY' : 'BIGMODEL_API_KEY';
        return {
          success: false,
          error: `Please configure ${envVar} in .env file.\n\nGet API key from:\n${this.config.modelEngine === 'MODE_QWEN' ? 'https://dashscope.console.aliyun.com/' : 'https://open.bigmodel.cn/'}`
        };
      }

      this.addToHistory('user', request.content);

      if (request.imageData) {
        return await this.processVisionRequest(request);
      }
      return await this.processChatRequest(request);

    } catch (error) {
      console.error('AgentOrchestrator error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Process Text Chat
  private async processChatRequest(request: AnalysisRequest): Promise<AgentResponse> {
    const messages = this.buildMessages(request.content, request.mode);
    
    const response = await chatCompletion(messages, this.config.modelEngine);
    
    if (!response) {
      throw new Error('Empty response from AI');
    }

    this.addToHistory('assistant', response);
    const analysis = this.parseAnalysisResponse(response, request.mode);

    return { success: true, analysis };
  }

  // Process Vision Request
  private async processVisionRequest(request: AnalysisRequest): Promise<AgentResponse> {
    const prompt = this.buildVisionPrompt(request.content, request.mode);
    
    const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      { type: 'text', text: prompt }
    ];

    if (request.imageData) {
      content.push({ type: 'image_url', image_url: { url: request.imageData } });
    }

    const response = await visionCompletion(content, this.config.modelEngine);

    if (!response) {
      throw new Error('Empty response from Vision AI');
    }

    this.addToHistory('assistant', response);
    const analysis = this.parseAnalysisResponse(response, request.mode);

    return { success: true, analysis };
  }

  // Build Messages
  private buildMessages(userContent: string, mode: UserMode) {
    const systemPrompt = this.buildSystemPrompt(mode);
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt }
    ];

    // Add recent history (limited for performance)
    const recentHistory = this.conversationHistory.slice(-this.config.maxHistoryLength);
    for (const msg of recentHistory) {
      messages.push({ role: msg.role, content: msg.content });
    }

    messages.push({ role: 'user', content: userContent });
    return messages;
  }

  // Build System Prompt
  private buildSystemPrompt(mode: UserMode): string {
    const engineInfo = MODEL_INFO[this.config.modelEngine];
    const modeInstructions = mode === 'ELDERLY' 
      ? `\n\nIMPORTANT: ELDERLY MODE. Respond with:
1. Very simple language
2. Short sentences
3. Clear YES/NO or SAFE/NOT SAFE answers
4. Traditional Chinese (Cantonese) for Hong Kong users
5. Be supportive and reassuring`
      : '\n\nDEFAULT MODE: Provide detailed analysis with specific indicators.';

    return FRAUD_DETECTION_SYSTEM_PROMPT + modeInstructions + `\n\nUsing: ${engineInfo.name}`;
  }

  // Build Vision Prompt
  private buildVisionPrompt(content: string, mode: UserMode): string {
    return mode === 'ELDERLY'
      ? `分析這張圖片是否有詐騙風險。用簡單的廣東話回答。開頭先講「安全」或「唔安全」。\n\n用戶關注：${content}\n\n回覆JSON格式：riskLevel, summary, details, recommendations, speakResponse`
      : `Analyze this image for fraud indicators. Provide detailed assessment.\n\nUser concern: ${content}\n\nRespond in JSON: riskLevel, summary, details, recommendations, speakResponse`;
  }

  // Parse Response
  private parseAnalysisResponse(response: string, mode: UserMode) {
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
    } catch (e) {
      console.warn('JSON parse failed, using fallback');
    }
    return this.generateFallbackAnalysis(response, mode);
  }

  // Fallback Analysis
  private generateFallbackAnalysis(response: string, mode: UserMode) {
    const lower = response.toLowerCase();
    let riskLevel = 'LOW';

    if (lower.includes('critical') || lower.includes('詐騙') || lower.includes('scam')) {
      riskLevel = 'CRITICAL';
    } else if (lower.includes('high') || lower.includes('可疑') || lower.includes('suspicious')) {
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
        speakResponse = `警告！呢個睇落可疑。${response.substring(0, 100)}。小心啲，唔好俾個人資料。`;
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

  // History Management
  private addToHistory(role: 'user' | 'assistant' | 'system', content: string): void {
    this.conversationHistory.push({ role, content, timestamp: new Date() });
    if (this.conversationHistory.length > this.config.maxHistoryLength * 2) {
      this.conversationHistory = this.conversationHistory.slice(-this.config.maxHistoryLength);
    }
  }

  public getHistory(): ConversationMessage[] {
    return [...this.conversationHistory];
  }

  public clearHistory(): void {
    this.conversationHistory = [];
  }
}

export const agentOrchestrator = AgentOrchestrator.getInstance();
