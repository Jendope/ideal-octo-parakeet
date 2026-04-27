/**
 * AI Client for FraudGuard HK
 * Direct API calls to Qwen (DashScope) and GLM (BigModel)
 * 
 * Models used:
 * - Qwen: qwen3.5-plus (chat), qwen-vl-ocr (vision), qwen3-asr-flash (speech)
 * - GLM: glm-4-flash (chat), glm-4.6v (vision)
 */

// API Configuration
interface AIConfig {
  apiKey: string;
  baseUrl: string;
  chatModel: string;
  visionModel: string;
  asrModel: string;
}

// Message type for chat
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Vision content type
export interface VisionContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string };
}

// Get configuration based on model engine
function getConfig(modelEngine: 'MODE_QWEN' | 'MODE_GLM'): AIConfig {
  if (modelEngine === 'MODE_QWEN') {
    return {
      apiKey: process.env.DASHSCOPE_API_KEY || '',
      baseUrl: process.env.DASHSCOPE_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
      chatModel: 'qwen3.5-plus',
      visionModel: 'qwen-vl-ocr',  // Best for OCR/screenshot analysis
      asrModel: 'qwen3-asr-flash-2026-02-10'  // Latest Qwen ASR model
    };
  }
  return {
    apiKey: process.env.BIGMODEL_API_KEY || '',
    baseUrl: process.env.BIGMODEL_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
    chatModel: 'glm-4-flash',  // Fast and cost-effective
    visionModel: 'glm-4.6v',   // Latest vision model with grounding
    asrModel: 'glm-asr-2512'   // GLM ASR model
  };
}

// Check if API key is configured
export function isApiKeyConfigured(modelEngine: 'MODE_QWEN' | 'MODE_GLM'): boolean {
  const config = getConfig(modelEngine);
  return !!(
    config.apiKey && 
    config.apiKey !== 'your_dashscope_api_key_here' &&
    config.apiKey !== 'your_bigmodel_api_key_here' &&
    !config.apiKey.includes('your_') &&
    !config.apiKey.includes('_here')
  );
}

// Chat completion with messages array
export async function chatCompletion(
  messages: ChatMessage[],
  modelEngine: 'MODE_QWEN' | 'MODE_GLM' = 'MODE_GLM'
): Promise<string> {
  const config = getConfig(modelEngine);

  if (!isApiKeyConfigured(modelEngine)) {
    throw new Error(
      `API key not configured for ${modelEngine}. ` +
      `Please set ${modelEngine === 'MODE_QWEN' ? 'DASHSCOPE_API_KEY' : 'BIGMODEL_API_KEY'} in .env file.`
    );
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.chatModel,
      messages,
      temperature: 0.7,
      max_tokens: 2048
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// Vision completion - supports both Qwen VL and GLM-4.6V
export async function visionCompletion(
  textPrompt: string,
  imageUrl: string,
  modelEngine: 'MODE_QWEN' | 'MODE_GLM' = 'MODE_GLM'
): Promise<string> {
  const config = getConfig(modelEngine);

  if (!isApiKeyConfigured(modelEngine)) {
    throw new Error(
      `API key not configured for ${modelEngine}. ` +
      `Please set ${modelEngine === 'MODE_QWEN' ? 'DASHSCOPE_API_KEY' : 'BIGMODEL_API_KEY'} in .env file.`
    );
  }

  // Build content array - image first, then text (as per GLM-4.6V format)
  const content: VisionContent[] = [
    { type: 'image_url', image_url: { url: imageUrl } },
    { type: 'text', text: textPrompt }
  ];

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.visionModel,
      messages: [{ role: 'user', content }],
      temperature: 0.7,
      max_tokens: 2048
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Vision API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// Vision completion with grounding coordinates (for GLM-4.6V)
export async function visionCompletionWithGrounding(
  imageUrl: string,
  question: string,
  modelEngine: 'MODE_QWEN' | 'MODE_GLM' = 'MODE_GLM'
): Promise<{ text: string; coordinates?: number[][] }> {
  const config = getConfig(modelEngine);

  if (!isApiKeyConfigured(modelEngine)) {
    throw new Error(`API key not configured for ${modelEngine}`);
  }

  // For GLM-4.6V with grounding
  const prompt = modelEngine === 'MODE_GLM' 
    ? `${question} Provide coordinates in [[xmin,ymin,xmax,ymax]] format if relevant.`
    : question;

  const content: VisionContent[] = [
    { type: 'image_url', image_url: { url: imageUrl } },
    { type: 'text', text: prompt }
  ];

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.visionModel,
      messages: [{ role: 'user', content }],
      temperature: 0.7,
      max_tokens: 2048
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Vision API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  
  // Extract coordinates from response if present
  const coordMatch = text.match(/\[\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\]/g);
  const coordinates = coordMatch?.map(c => JSON.parse(c)) || undefined;

  return { text, coordinates };
}

// Speech to Text - Supports both Qwen ASR and GLM ASR
export async function speechToText(
  audioBase64: string,
  modelEngine: 'MODE_QWEN' | 'MODE_GLM' = 'MODE_GLM'
): Promise<string> {
  const config = getConfig(modelEngine);

  if (!isApiKeyConfigured(modelEngine)) {
    throw new Error(
      `API key not configured for ${modelEngine}. ` +
      `Please set ${modelEngine === 'MODE_QWEN' ? 'DASHSCOPE_API_KEY' : 'BIGMODEL_API_KEY'} in .env file.`
    );
  }

  if (modelEngine === 'MODE_QWEN') {
    // Qwen ASR - Uses JSON body with base64 audio
    const response = await fetch(`${config.baseUrl}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.asrModel,
        file: audioBase64,
        language: 'zh',
        response_format: 'json'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Qwen ASR API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.text || '';
  } else {
    // GLM ASR - Uses multipart/form-data
    // Convert base64 to buffer for form data
    const base64Data = audioBase64.replace(/^data:audio\/\w+;base64,/, '');
    const audioBuffer = Buffer.from(base64Data, 'base64');
    
    // Build multipart form data
    const boundary = '----FormBoundary' + Date.now();
    const formData = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="model"',
      '',
      config.asrModel,
      `--${boundary}`,
      'Content-Disposition: form-data; name="stream"',
      '',
      'false',
      `--${boundary}`,
      'Content-Disposition: form-data; name="file"; filename="audio.wav"',
      'Content-Type: audio/wav',
      '',
    ].join('\r\n');
    
    const formDataEnd = `\r\n--${boundary}--\r\n`;
    
    // Combine form data parts
    const formDataBuffer = Buffer.concat([
      Buffer.from(formData, 'utf-8'),
      audioBuffer,
      Buffer.from(formDataEnd, 'utf-8')
    ]);

    const response = await fetch(`${config.baseUrl}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: formDataBuffer
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GLM ASR API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.text || '';
  }
}

// Text to Speech - Routes to DashScope (Qwen) or BigModel (GLM) based on engine
export async function textToSpeech(
  text: string,
  options: {
    voice?: string;
    speed?: number;
    modelEngine?: 'MODE_QWEN' | 'MODE_GLM';
  } = {}
): Promise<ArrayBuffer> {
  const { voice, speed = 0.9, modelEngine = 'MODE_GLM' } = options;

  // Configuration for each engine
  const configs = {
    MODE_QWEN: {
      apiKey: process.env.DASHSCOPE_API_KEY,
      // Native DashScope TTS endpoint (NO trailing spaces!)
      endpoint: 'https://dashscope-intl.aliyuncs.com/api/v1/services/audio/tts/generation',
      model: 'cosyvoice-v3-flash',
      defaultVoice: 'longxiaochun',
      // Native format: input object + parameters
      buildBody: (txt: string, v: string) => ({
        model: 'cosyvoice-v3-flash',
        input: { text: txt },
        parameters: {
          voice: v,
          sample_rate: 16000
        }
      })
    },
    MODE_GLM: {
      apiKey: process.env.BIGMODEL_API_KEY,
      // BigModel GLM-TTS endpoint (OpenAI-compatible, NO trailing spaces!)
      endpoint: 'https://open.bigmodel.cn/api/paas/v4/audio/speech',
      model: 'glm-tts',
      defaultVoice: 'xiaoyan',
      // OpenAI-compatible format: input string + root-level params
      buildBody: (txt: string, v: string, spd: number) => ({
        model: 'glm-tts',
        input: txt,                    // ← Plain STRING (critical!)
        voice: v,
        speed: Math.max(0.5, Math.min(2.0, spd)),
        response_format: 'wav'
      })
    }
  };

  const config = configs[modelEngine];
  
  if (!config.apiKey || config.apiKey.includes('your_')) {
    throw new Error(
      `${modelEngine === 'MODE_QWEN' ? 'DASHSCOPE' : 'BIGMODEL'}_API_KEY required for TTS`
    );
  }

  const selectedVoice = voice || config.defaultVoice;

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify(config.buildBody(text, selectedVoice, speed))
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`TTS API Error (${response.status}): ${errorText}`);
  }

  return response.arrayBuffer();
}

// Agent types
export interface AgentAction {
  type: 'open_app' | 'check_messages' | 'analyze_screen' | 'make_call' | 'send_message' | 'search_web' | 'none';
  appName?: string;
  description: string;
  params?: Record<string, unknown>;
}

export interface AgentPlan {
  intent: string;
  action: AgentAction;
  confidence: number;
  requiresConfirmation: boolean;
  speakResponse: string;
}

// Model info for display
export const MODEL_INFO = {
  MODE_QWEN: {
    name: 'Qwen Engine',
    description: 'Qwen Plus (Chat) + Qwen VL OCR (Vision) + Qwen3 ASR',
    provider: 'DashScope International (Singapore)',
    models: {
      chat: 'qwen3.5-plus',
      vision: 'qwen-vl-ocr',
      asr: 'qwen3-asr-flash-2026-02-10'
    }
  },
  MODE_GLM: {
    name: 'GLM Engine', 
    description: 'GLM-4-Flash (Chat) + GLM-4.6V (Vision) + GLM-ASR (Speech)',
    provider: 'BigModel (China)',
    models: {
      chat: 'glm-4-flash',
      vision: 'glm-4.6v',
      asr: 'glm-asr-2512'
    }
  }
};








