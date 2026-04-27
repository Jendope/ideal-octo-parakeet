/**
 * AppConfig - Configuration Manager for FraudGuard HK
 * Manages model switching between Qwen and GLM engines
 */

// Model Engine Types
export type ModelEngine = 'MODE_QWEN' | 'MODE_GLM';

// User Interface Modes
export type UserMode = 'ELDERLY' | 'DEFAULT';

// Language Types
export type Language = 'en' | 'zh-HK' | 'zh-CN';

// Model Configuration Interface
export interface ModelConfig {
  chatModel: string;
  visionModel: string;
  displayName: string;
  description: string;
  apiProvider: string;
  apiEndpoint: string;
}

// Model Configurations
// Qwen: DashScope Singapore/International endpoint
// GLM: BigModel China endpoint
export const MODEL_CONFIGS: Record<ModelEngine, ModelConfig> = {
  MODE_QWEN: {
    chatModel: 'qwen-plus',
    visionModel: 'qwen-vl-plus',
    displayName: 'Qwen Engine',
    description: 'Qwen Plus (Chat) + Qwen VL (Vision)',
    apiProvider: 'DashScope International',
    apiEndpoint: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
  },
  MODE_GLM: {
    chatModel: 'glm-4-flash',  // Faster and cheaper
    visionModel: 'glm-4v-flash',
    displayName: 'GLM Engine',
    description: 'GLM-4-Flash (Chat) + GLM-4V (Vision)',
    apiProvider: 'BigModel',
    apiEndpoint: 'https://open.bigmodel.cn/api/paas/v4'
  }
};

// Default Configuration - ELDERLY mode for Hong Kong users
const DEFAULT_CONFIG = {
  modelEngine: 'MODE_GLM' as ModelEngine,
  userMode: 'ELDERLY' as UserMode,  // Default to ELDERLY mode
  language: 'zh-HK' as Language,
  voiceSpeed: 0.9,
  highContrast: true,
  fontSize: 'large' as 'normal' | 'large' | 'extra-large',
  ragEnabled: true
};

// Configuration Manager Class
export class AppConfig {
  private static instance: AppConfig;
  private config: typeof DEFAULT_CONFIG;

  private constructor() {
    this.config = { ...DEFAULT_CONFIG };
  }

  public static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  public getModelEngine(): ModelEngine {
    return this.config.modelEngine;
  }

  public setModelEngine(engine: ModelEngine): void {
    this.config.modelEngine = engine;
  }

  public getUserMode(): UserMode {
    return this.config.userMode;
  }

  public setUserMode(mode: UserMode): void {
    this.config.userMode = mode;
  }

  public getLanguage(): Language {
    return this.config.language;
  }

  public setLanguage(lang: Language): void {
    this.config.language = lang;
  }

  public getModelConfig(): ModelConfig {
    return MODEL_CONFIGS[this.config.modelEngine];
  }

  public getChatModel(): string {
    return MODEL_CONFIGS[this.config.modelEngine].chatModel;
  }

  public getVisionModel(): string {
    return MODEL_CONFIGS[this.config.modelEngine].visionModel;
  }

  public getVoiceSpeed(): number {
    return this.config.voiceSpeed;
  }

  public setVoiceSpeed(speed: number): void {
    this.config.voiceSpeed = Math.max(0.5, Math.min(2.0, speed));
  }

  public isHighContrast(): boolean {
    return this.config.highContrast;
  }

  public setHighContrast(enabled: boolean): void {
    this.config.highContrast = enabled;
  }

  public getFontSize(): string {
    return this.config.fontSize;
  }

  public setFontSize(size: 'normal' | 'large' | 'extra-large'): void {
    this.config.fontSize = size;
  }

  public isRagEnabled(): boolean {
    return this.config.ragEnabled;
  }

  public setRagEnabled(enabled: boolean): void {
    this.config.ragEnabled = enabled;
  }

  public getFullConfig(): typeof DEFAULT_CONFIG {
    return { ...this.config };
  }

  public resetToDefaults(): void {
    this.config = { ...DEFAULT_CONFIG };
  }
}

export const appConfig = AppConfig.getInstance();

export function getModelEngineFromConfig(engine: ModelEngine): ModelConfig {
  return MODEL_CONFIGS[engine];
}

// Fraud Detection System Prompt
export const FRAUD_DETECTION_SYSTEM_PROMPT = `You are FraudGuard HK, an AI fraud detection assistant protecting Hong Kong users, especially elderly people, from scams.

Your responsibilities:
1. Analyze messages, emails, and notifications for fraud indicators
2. Identify common scam patterns: phishing, lottery scams, romance scams, tech support scams, investment fraud
3. Provide clear, simple explanations about suspicious content
4. Give actionable safety recommendations
5. Always prioritize user safety

When analyzing content:
- Look for urgency language ("act now", "limited time")
- Check for requests for personal information or money
- Identify suspicious links or attachments
- Detect impersonation attempts
- Recognize too-good-to-be-true offers

Response Format (JSON):
{
  "riskLevel": "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "summary": "Brief summary",
  "details": "Detailed explanation",
  "recommendations": ["action1", "action2"],
  "speakResponse": "Voice-friendly response"
}`;

// Agent Response Interface
export interface AgentResponse {
  success: boolean;
  analysis?: {
    riskLevel: string;
    summary: string;
    details: string;
    recommendations: string[];
    speakResponse: string;
  };
  error?: string;
}
