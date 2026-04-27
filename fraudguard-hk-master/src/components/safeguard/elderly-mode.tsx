'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Mic, MicOff, Volume2, AlertTriangle, CheckCircle, 
  Settings, RefreshCw, Keyboard, MessageSquare, Smartphone, ExternalLink,
  Play, Pause, Cpu, Users, Camera, X, Loader2, Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ModelEngine } from '@/lib/app-config';
import { useTranslation, Language } from '@/lib/i18n';
import { LanguageSelector } from './language-selector';
import type { AgentPlan } from '@/lib/ai-client';
import { useAndroidBridge } from '@/hooks/use-android-bridge';
import { FamilyAlertPanel } from './family-alert-panel';

interface ElderlyModeProps {
  modelEngine: ModelEngine;
  onSwitchMode: () => void;
  onOpenSettings: () => void;
}

interface AnalysisResult {
  riskLevel: string;
  summary: string;
  details: string;
  recommendations: string[];
  speakResponse: string;
}

export function ElderlyMode({ modelEngine, onSwitchMode, onOpenSettings }: ElderlyModeProps) {
  const { t, language } = useTranslation();
  const androidBridge = useAndroidBridge();
  const [inputMode, setInputMode] = useState<'voice' | 'text' | 'image'>('voice');
  const [textInput, setTextInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [micAvailable, setMicAvailable] = useState<boolean | null>(null);
  
  // Image upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Autonomous agent state
  const [agentPlan, setAgentPlan] = useState<AgentPlan | null>(null);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [showActionPanel, setShowActionPanel] = useState(false);
  const [useAndroidVoice, setUseAndroidVoice] = useState(false);
  
  // Family alert state
  const [showFamilyAlert, setShowFamilyAlert] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check microphone availability on mount
  useEffect(() => {
    const checkMicAvailability = async () => {
      // If Android bridge is available, use it for voice recognition
      if (androidBridge.isReady && androidBridge.isAndroid) {
        setMicAvailable(true);
        setUseAndroidVoice(true);
        return;
      }
      
      try {
        const isSecureContext = window.isSecureContext;
        const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        
        if (!isSecureContext || !hasMediaDevices) {
          setMicAvailable(false);
          return;
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setMicAvailable(true);
      } catch {
        setMicAvailable(false);
      }
    };
    
    checkMicAvailability();
  }, [androidBridge.isReady, androidBridge.isAndroid]);

  // Risk level config
  const riskConfig = {
    SAFE: { color: 'bg-green-500', textColor: 'text-green-500', message: t('safe'), icon: CheckCircle },
    LOW: { color: 'bg-yellow-500', textColor: 'text-yellow-500', message: t('lowRisk'), icon: AlertTriangle },
    MEDIUM: { color: 'bg-orange-500', textColor: 'text-orange-500', message: t('mediumRisk'), icon: AlertTriangle },
    HIGH: { color: 'bg-red-500', textColor: 'text-red-500', message: t('highRisk'), icon: AlertTriangle },
    CRITICAL: { color: 'bg-red-700', textColor: 'text-red-700', message: t('critical'), icon: AlertTriangle }
  };

  // Action type icons and colors
  const actionConfig: Record<string, { icon: typeof Smartphone; color: string; label: string }> = {
    open_app: { icon: Smartphone, color: 'bg-blue-500', label: t('actionOpenApp') || 'Open App' },
    check_messages: { icon: MessageSquare, color: 'bg-green-500', label: t('actionCheckMessages') || 'Check Messages' },
    analyze_screen: { icon: Shield, color: 'bg-purple-500', label: t('actionAnalyzeScreen') || 'Analyze Screen' },
    make_call: { icon: Smartphone, color: 'bg-cyan-500', label: t('actionMakeCall') || 'Make Call' },
    send_message: { icon: MessageSquare, color: 'bg-teal-500', label: t('actionSendMessage') || 'Send Message' },
    search_web: { icon: ExternalLink, color: 'bg-indigo-500', label: t('actionSearchWeb') || 'Search Web' },
    none: { icon: Shield, color: 'bg-gray-500', label: t('actionNone') || 'Analyze Only' }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);
      setImageData(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Analyze image
  const analyzeImage = async () => {
    if (!imageData) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/agent/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData,
          prompt: t('analyzeImagePrompt') || 'Analyze this image for any signs of scam or fraud. Check for suspicious messages, phishing links, fake offers, or any fraudulent content. Respond in the language of the user.',
          modelEngine,
          language
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Vision analysis failed');
      }
      
      setTranscript(t('imageUploaded') || 'Image uploaded for analysis');
      setResult(data.analysis);
      
      if (data.analysis?.speakResponse) {
        await speakResponse(data.analysis.speakResponse);
      }
    } catch (err) {
      console.error('Image analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setIsProcessing(false);
    }
  };

  // Get language code for ASR - uses app language (auto-detection)
  const getAsrLanguageCode = (lang: Language): string => {
    switch (lang) {
      case 'zh-HK': return 'zh-HK';
      case 'zh-CN': return 'zh-CN';
      case 'en': return 'en';
      default: return 'zh-HK';
    }
  };

  // Start voice recording
  const startListening = useCallback(async () => {
    // Use Android bridge voice recognition if available
    if (useAndroidVoice && androidBridge.bridge) {
      // Set up callback for voice result
      (window as unknown as { onVoiceResult: (text: string) => void }).onVoiceResult = (text: string) => {
        setIsListening(false);
        setTranscript(text);
        processUserIntent(text);
      };
      
      // Use app language for ASR (auto-detection based on app settings)
      const androidLangMap: Record<Language, string> = {
        'zh-HK': 'zh-HK',
        'zh-CN': 'zh-CN',
        'en': 'en-US'
      };
      const androidLang = androidLangMap[language] || 'zh-HK';
      androidBridge.bridge.startVoiceRecognition('onVoiceResult');
      setIsListening(true);
      setError(null);
      setResult(null);
      setAgentPlan(null);
      return;
    }
    
    // Fallback to web audio recording
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(t('microphoneRequiresHttps'));
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        stream.getTracks().forEach(track => track.stop());
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsListening(true);
      setError(null);
      setResult(null);
      setAgentPlan(null);
    } catch (err) {
      console.error('Microphone access error:', err);
      setError(err instanceof Error ? err.message : t('microphonePermissionDenied'));
    }
  }, [t, useAndroidVoice, androidBridge.bridge, language]);

  // Stop voice recording
  const stopListening = useCallback(() => {
    // If using Android voice, just update state
    if (useAndroidVoice && androidBridge.bridge) {
      setIsListening(false);
      return;
    }
    
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  }, [isListening, useAndroidVoice, androidBridge.bridge]);

  // Process audio through ASR - uses app language
  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      await new Promise<void>((resolve) => {
        reader.onloadend = () => resolve();
      });

      const audioData = reader.result as string;
      // Use app language for ASR (auto-detection)
      const asrLang = getAsrLanguageCode(language);

      const asrResponse = await fetch('/api/agent/asr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioData, modelEngine, language: asrLang })
      });

      const asrResult = await asrResponse.json();

      if (!asrResult.success) {
        throw new Error(asrResult.error || 'ASR failed');
      }

      setTranscript(asrResult.transcription);
      await processUserIntent(asrResult.transcription);

    } catch (err) {
      console.error('Audio processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process audio');
    } finally {
      setIsProcessing(false);
    }
  };

  // Process user intent - autonomous agent
  const processUserIntent = async (text: string) => {
    setIsProcessing(true);

    try {
      // First, parse user intent for autonomous actions
      const intentResponse = await fetch('/api/agent/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, modelEngine, language })
      });

      const intentData = await intentResponse.json();
      setAgentPlan(intentData.plan);
      setShowActionPanel(true);

      // If action is 'none' or 'check_messages', do fraud analysis
      if (intentData.plan?.action?.type === 'none' || 
          intentData.plan?.action?.type === 'check_messages') {
        await analyzeContent(text);
      } else {
        // For other actions, just speak the response
        setResult({
          riskLevel: 'INFO',
          summary: intentData.plan?.action?.description || '',
          details: intentData.plan?.speakResponse || '',
          recommendations: [],
          speakResponse: intentData.plan?.speakResponse || ''
        });
        
        if (intentData.plan?.speakResponse) {
          await speakResponse(intentData.plan.speakResponse);
        }
      }

    } catch (err) {
      console.error('Intent processing error:', err);
      // Fallback to regular analysis
      await analyzeContent(text);
    } finally {
      setIsProcessing(false);
    }
  };

  // Analyze content for fraud
  const analyzeContent = async (text: string) => {
    setIsProcessing(true);

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          mode: 'ELDERLY',
          modelEngine,
          language
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResult(data.analysis);
      
      if (data.analysis?.speakResponse) {
        await speakResponse(data.analysis.speakResponse);
      }

    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Execute autonomous action
  const executeAction = async () => {
    if (!agentPlan?.action) return;
    
    setIsExecutingAction(true);
    
    try {
      const action = agentPlan.action;
      
      // Use Android bridge if available for native execution
      if (androidBridge.isReady && androidBridge.bridge) {
        const actionJson = {
          type: action.type,
          app_name: action.appName,
          phone_number: action.params?.phone_number || action.params?.contact,
          message: action.params?.message,
          query: action.params?.query
        };
        
        const result = androidBridge.executeAction(actionJson);
        
        if (result.success) {
          setResult({
            riskLevel: 'INFO',
            summary: action.description,
            details: `已執行操作：${action.type}`,
            recommendations: [],
            speakResponse: action.description
          });
          
          // Speak confirmation using Android TTS
          if (action.description) {
            androidBridge.speak(action.description);
          }
        } else {
          setError(result.error || '執行失敗');
        }
        
        setShowActionPanel(false);
        setIsExecutingAction(false);
        return;
      }
      
      // Fallback: Call backend API for simulated execution
      const response = await fetch('/api/agent/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action, 
          transcript,
          modelEngine 
        })
      });

      const data = await response.json();
      
      // Show result
      if (data.success && data.analysis) {
        setResult(data.analysis);
        if (data.analysis.speakResponse) {
          await speakResponse(data.analysis.speakResponse);
        }
      }
      
      setShowActionPanel(false);
    } catch (err) {
      console.error('Action execution error:', err);
      setError('Failed to execute action');
    } finally {
      setIsExecutingAction(false);
    }
  };

  // Text-to-Speech
  const speakResponse = async (text: string) => {
    setIsSpeaking(true);

    try {
      const response = await fetch('/api/agent/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: 'tongtong',
          speed: 0.8,
          modelEngine
        })
      });

      if (!response.ok) throw new Error('TTS failed');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audioRef.current.play();
    } catch (err) {
      console.error('TTS error:', err);
      setIsSpeaking(false);
    }
  };

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  // Clear all results
  const clearResults = () => {
    setResult(null);
    setTranscript('');
    setError(null);
    setTextInput('');
    setAgentPlan(null);
    setShowActionPanel(false);
    setShowFamilyAlert(false);
    setImagePreview(null);
    setImageData(null);
    setInputMode('voice');
  };

  // Handle text input submit
  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
    setTranscript(textInput);
    await processUserIntent(textInput);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const currentRisk = result ? riskConfig[result.riskLevel as keyof typeof riskConfig] || riskConfig.LOW : null;
  const RiskIcon = currentRisk?.icon || AlertTriangle;
  const currentAction = agentPlan?.action ? actionConfig[agentPlan.action.type] : null;
  const ActionIcon = currentAction?.icon || Shield;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header - Simplified & Bigger */}
      <header className="bg-yellow-500 text-black p-4 sm:p-5 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Shield className="w-10 h-10 sm:w-12 sm:h-12 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold truncate">{t('appTitle')}</h1>
              <p className="text-sm sm:text-base truncate">{t('appSubtitle')}</p>
            </div>
            {/* Android bridge indicator */}
            {androidBridge.isReady && (
              <Badge className="bg-green-700 text-white text-xs ml-2 shrink-0 px-2 py-1">
                <Cpu className="w-3 h-3 mr-1" />
                Android
              </Badge>
            )}
          </div>
          <div className="flex gap-2 items-center shrink-0">
            <LanguageSelector variant="compact" />
            <Button onClick={onOpenSettings} className="bg-black text-yellow-500 p-3">
              <Settings className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Bigger & Simpler */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Initial State - SIMPLIFIED */}
          {!result && !isProcessing && !transcript && !showActionPanel && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-8 w-full max-w-lg px-4"
            >
              {/* Big Title */}
              <div className="text-center px-2">
                <h2 className="text-2xl sm:text-3xl md:text-4xl text-white font-bold mb-2">
                  {t('needHelp')}
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-300">
                  {t('tapButtonInstruction')}
                </p>
              </div>

              {/* Voice Mode - ONE BIG BUTTON */}
              {inputMode === 'voice' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-6 w-full"
                >
                  {!micAvailable && micAvailable !== null && (
                    <div className="bg-orange-900/50 border border-orange-500 p-4 rounded-xl text-center max-w-sm mb-4">
                      <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                      <p className="text-orange-200 text-base">
                        {t('microphoneRequiresHttps')}
                      </p>
                      <Button
                        onClick={() => setInputMode('text')}
                        className="mt-3 bg-orange-500 text-black text-base py-3 px-6"
                      >
                        {t('useTextInput')}
                      </Button>
                    </div>
                  )}
                  
                  {/* ONE BIG MIC BUTTON - Responsive sizing */}
                  <motion.button
                    onClick={isListening ? stopListening : startListening}
                    disabled={micAvailable === false}
                    className={cn(
                      "relative w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full flex flex-col items-center justify-center",
                      "border-4 transition-all duration-300 shadow-2xl",
                      isListening 
                        ? "bg-red-600 border-red-400 animate-pulse" 
                        : "bg-yellow-500 border-yellow-300 hover:scale-105",
                      micAvailable === false && "opacity-50 cursor-not-allowed"
                    )}
                    whileTap={micAvailable ? { scale: 0.95 } : undefined}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-white mb-1" />
                        <span className="text-base sm:text-lg md:text-2xl font-bold text-white">{t('tapToStop')}</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-black mb-1" />
                        <span className="text-base sm:text-lg md:text-2xl font-bold text-black">{t('helpMeCheck')}</span>
                      </>
                    )}
                  </motion.button>

                  {/* Alternative Input Options - Responsive buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-5 w-full max-w-md px-2">
                    <Button
                      onClick={() => setInputMode('text')}
                      variant="outline"
                      className="bg-gray-800 border-2 border-gray-600 text-white hover:bg-gray-700 text-lg sm:text-xl py-5 sm:py-6 px-6 sm:px-8 flex-1"
                    >
                      <Keyboard className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3" />
                      {t('textInput')}
                    </Button>
                    <Button
                      onClick={() => setInputMode('image')}
                      variant="outline"
                      className="bg-gray-800 border-2 border-gray-600 text-white hover:bg-gray-700 text-lg sm:text-xl py-5 sm:py-6 px-6 sm:px-8 flex-1"
                    >
                      <ImageIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3" />
                      {t('imageInput') || 'Image'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Text Mode */}
              {inputMode === 'text' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full max-w-md space-y-5"
                >
                  <Textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={t('placeholder')}
                    className="text-xl p-5 min-h-[140px] bg-gray-800 border-2 border-gray-700 text-white"
                  />
                  <Button
                    onClick={handleTextSubmit}
                    disabled={!textInput.trim()}
                    className="w-full bg-yellow-500 text-black hover:bg-yellow-400 text-xl py-5"
                  >
                    {t('analyze')}
                  </Button>
                  <Button
                    onClick={() => setInputMode('voice')}
                    variant="outline"
                    className="w-full bg-gray-800 border-2 border-gray-600 text-white hover:bg-gray-700 text-xl py-5"
                  >
                    <Mic className="w-7 h-7 mr-3" />
                    {t('voiceInput')}
                  </Button>
                </motion.div>
              )}

              {/* Image Mode */}
              {inputMode === 'image' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full max-w-md space-y-5"
                >
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Uploaded" 
                        className="w-full rounded-xl max-h-80 object-contain bg-gray-900"
                      />
                      <Button
                        onClick={() => {
                          setImagePreview(null);
                          setImageData(null);
                        }}
                        variant="destructive"
                        size="sm"
                        className="absolute top-3 right-3 bg-red-500 text-white p-3"
                      >
                        <X className="w-6 h-6" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-600 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500 transition-colors"
                    >
                      <Camera className="w-20 h-20 text-gray-400 mb-4" />
                      <p className="text-gray-400 text-xl text-center">
                        {t('uploadImagePrompt') || 'Tap to upload screenshot'}
                      </p>
                      <p className="text-gray-500 text-base mt-2 text-center">
                        {t('uploadImageHint') || 'Take a screenshot of suspicious message'}
                      </p>
                    </div>
                  )}
                  
                  <Button
                    onClick={analyzeImage}
                    disabled={!imageData || isProcessing}
                    className="w-full bg-yellow-500 text-black hover:bg-yellow-400 text-xl py-5"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-7 h-7 mr-3 animate-spin" />
                        {t('analyzing') || 'Analyzing...'}
                      </>
                    ) : (
                      <>
                        <Shield className="w-7 h-7 mr-3" />
                        {t('analyzeImage') || 'Analyze'}
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setInputMode('voice')}
                    variant="outline"
                    className="w-full bg-gray-800 border-2 border-gray-600 text-white hover:bg-gray-700 text-xl py-5"
                  >
                    <Mic className="w-7 h-7 mr-3" />
                    {t('voiceInput')}
                  </Button>
                </motion.div>
              )}

              {/* Examples - Simplified */}
              <div className="text-center text-gray-400 text-sm sm:text-base max-w-md mt-4 px-4">
                <p className="font-medium mb-1">{t('exampleTitle')}</p>
                <p>{t('example1')}</p>
              </div>
            </motion.div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-2xl sm:text-3xl text-white font-bold">{t('checkingForYou')}</p>
              {transcript && (
                <p className="text-lg sm:text-xl text-gray-300 max-w-md text-center px-4">
                  &quot;{transcript}&quot;
                </p>
              )}
            </motion.div>
          )}

          {/* Action Panel - Autonomous Agent */}
          {showActionPanel && agentPlan && !isProcessing && !result && (
            <motion.div
              key="action"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-5 max-w-md w-full px-4"
            >
              {/* What AI understood */}
              <div className="bg-gray-800 p-5 rounded-xl w-full">
                <p className="text-gray-400 text-base mb-2">{t('youSaid')}</p>
                <p className="text-white text-xl">&quot;{transcript}&quot;</p>
              </div>

              {/* Action card */}
              <div className={cn(
                "w-full p-5 rounded-xl text-white",
                currentAction?.color || 'bg-blue-500'
              )}>
                <div className="flex items-center gap-4 mb-3">
                  <ActionIcon className="w-10 h-10" />
                  <div>
                    <p className="font-bold text-xl">{currentAction?.label || 'Action'}</p>
                    <p className="text-base opacity-90">{agentPlan.action?.description}</p>
                  </div>
                </div>
                
                {agentPlan.action?.appName && (
                  <Badge variant="secondary" className="bg-white/20 text-white text-base px-3 py-1">
                    {agentPlan.action.appName}
                  </Badge>
                )}
              </div>

              {/* AI Response */}
              <div className="bg-gray-900 p-5 rounded-xl w-full">
                <p className="text-gray-300 text-lg">{agentPlan.speakResponse}</p>
              </div>

              {/* Action Buttons - Bigger for elderly */}
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                {agentPlan.action?.type !== 'none' && (
                  <Button
                    onClick={executeAction}
                    disabled={isExecutingAction}
                    className="bg-green-500 text-white hover:bg-green-600 text-xl py-5 px-8 flex-1"
                  >
                    <Play className="w-7 h-7 mr-3" />
                    {t('executeAction') || 'Execute'}
                  </Button>
                )}
                <Button
                  onClick={clearResults}
                  className="bg-gray-700 text-white hover:bg-gray-600 text-xl py-5 px-8 flex-1"
                >
                  <RefreshCw className="w-7 h-7 mr-3" />
                  {t('checkAnother')}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Result State - Bigger */}
          {result && !isProcessing && !showActionPanel && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-5 max-w-2xl w-full px-4"
            >
              {/* Risk Level Banner */}
              <div className={cn(
                "w-full p-5 rounded-xl flex items-center gap-5",
                currentRisk?.color || 'bg-gray-500'
              )}>
                <RiskIcon className="w-14 h-14 sm:w-20 sm:h-20 text-white shrink-0" />
                <div className="text-white min-w-0">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                    {currentRisk?.message || t('analysisComplete')}
                  </h2>
                  <p className="text-base sm:text-lg opacity-90">{result.summary}</p>
                </div>
              </div>

              {/* Transcript */}
              {transcript && (
                <div className="bg-gray-900 p-4 rounded-xl w-full">
                  <p className="text-gray-400 text-sm mb-2">{t('youSaid')}</p>
                  <p className="text-white text-lg">&quot;{transcript}&quot;</p>
                </div>
              )}

              {/* Details */}
              <div className="bg-gray-900 p-5 rounded-xl w-full">
                <h3 className="text-lg text-yellow-500 font-bold mb-3">{t('details')}</h3>
                <p className="text-white text-lg leading-relaxed">{result.details}</p>
              </div>

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="bg-gray-900 p-5 rounded-xl w-full">
                  <h3 className="text-lg text-yellow-500 font-bold mb-3">{t('whatToDo')}</h3>
                  <ul className="space-y-3">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="text-white text-lg flex items-start gap-3">
                        <span className="text-yellow-500 font-bold shrink-0">{i + 1}.</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Family Alert Panel - Show when high/critical risk */}
              {(result.riskLevel === 'HIGH' || result.riskLevel === 'CRITICAL') && showFamilyAlert && (
                <FamilyAlertPanel
                  riskLevel={result.riskLevel}
                  message={transcript}
                  summary={result.summary}
                  onDismiss={() => setShowFamilyAlert(false)}
                />
              )}

              {/* Action Buttons - Bigger for elderly */}
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                {/* Notify Family button for high/critical risk */}
                {(result.riskLevel === 'HIGH' || result.riskLevel === 'CRITICAL') && !showFamilyAlert && (
                  <Button
                    onClick={() => setShowFamilyAlert(true)}
                    className="bg-red-500 text-white hover:bg-red-600 text-xl py-5 px-6 flex-1"
                  >
                    <Users className="w-7 h-7 mr-3" />
                    {t('notifyFamily') || 'Notify Family'}
                  </Button>
                )}
                <Button
                  onClick={() => result.speakResponse && speakResponse(result.speakResponse)}
                  disabled={isSpeaking}
                  className="bg-yellow-500 text-black hover:bg-yellow-400 text-xl py-5 px-6 flex-1"
                >
                  {isSpeaking ? (
                    <>
                      <Pause className="w-7 h-7 mr-3" />
                      {t('speaking')}
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-7 h-7 mr-3" />
                      {t('readAloud')}
                    </>
                  )}
                </Button>
                <Button
                  onClick={clearResults}
                  className="bg-gray-700 text-white hover:bg-gray-600 text-xl py-5 px-6 flex-1"
                >
                  <RefreshCw className="w-7 h-7 mr-3" />
                  {t('checkAnother')}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {error && !isProcessing && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-5 px-4"
            >
              <div className="bg-red-900/50 border-2 border-red-500 p-6 rounded-xl text-center max-w-md">
                <AlertTriangle className="w-14 h-14 text-red-500 mx-auto mb-4" />
                <p className="text-2xl text-white font-bold mb-3">{t('somethingWentWrong')}</p>
                <p className="text-lg text-gray-300">{error}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Button onClick={clearResults} className="bg-yellow-500 text-black text-xl py-5 px-6 flex-1">
                  {t('tryAgain')}
                </Button>
                <Button onClick={() => { setError(null); setInputMode('text'); }} className="bg-gray-700 text-white text-xl py-5 px-6 flex-1">
                  {t('useTextInput')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer with mode switch */}
      <footer className="bg-gray-900 border-t border-gray-800 p-3 shrink-0">
        <div className="max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-400 text-xs sm:text-sm">
            {t('poweredBy')} {modelEngine === 'MODE_GLM' ? 'GLM-4' : 'Qwen'} • {t('footer')}
          </p>
          <Button
            onClick={onSwitchMode}
            variant="outline"
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 text-sm py-1 px-3"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {t('switchToChatMode')}
          </Button>
        </div>
      </footer>
    </div>
  );
}
