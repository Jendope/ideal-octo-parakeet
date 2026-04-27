'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Send, Mic, MicOff, Volume2, Settings, AlertTriangle, CheckCircle, Loader2, Image as ImageIcon, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ModelEngine } from '@/lib/app-config';
import { useTranslation } from '@/lib/i18n';
import { LanguageSelector } from './language-selector';

interface DefaultModeProps {
  modelEngine: ModelEngine;
  onSwitchMode: () => void;
  onOpenSettings: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  analysis?: {
    riskLevel: string;
    summary: string;
    details: string;
    recommendations: string[];
  };
  imageData?: string;
}

interface AnalysisResult {
  riskLevel: string;
  summary: string;
  details: string;
  recommendations: string[];
  speakResponse: string;
}

// Match elderly mode risk colors
const riskConfig: Record<string, { bg: string; text: string; border: string; icon: typeof CheckCircle }> = {
  SAFE: { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500', icon: CheckCircle },
  LOW: { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500', icon: AlertTriangle },
  MEDIUM: { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500', icon: AlertTriangle },
  HIGH: { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500', icon: AlertTriangle },
  CRITICAL: { bg: 'bg-red-700', text: 'text-red-300', border: 'border-red-700', icon: AlertTriangle }
};

export function DefaultMode({ modelEngine, onSwitchMode, onOpenSettings }: DefaultModeProps) {
  const { t, language } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!input.trim() && !imageData) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      imageData: imageData || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    const currentImage = imageData;
    setImageData(null);
    setImagePreview(null);

    try {
      let response;
      
      if (currentImage) {
        // Vision API call
        response = await fetch('/api/agent/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: input || 'Analyze this image for potential fraud or scams',
            imageData: currentImage,
            mode: 'DEFAULT',
            modelEngine,
            language
          })
        });
      } else {
        // Chat API call
        response = await fetch('/api/agent/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: input,
            mode: 'DEFAULT',
            modelEngine,
            language
          })
        });
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.analysis?.speakResponse || data.analysis?.summary || 'Analysis complete',
        timestamp: new Date(),
        analysis: data.analysis
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice input - uses app language for auto-detection
  const startListening = useCallback(async () => {
    try {
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
        
        // Convert to base64 and send to ASR
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const audioData = reader.result as string;
          
          // Get language code for ASR
          const asrLang = language === 'zh-HK' ? 'zh-HK' : language === 'zh-CN' ? 'zh-CN' : 'en';
          
          try {
            const response = await fetch('/api/agent/asr', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioData, language: asrLang })
            });
            
            const data = await response.json();
            if (data.success) {
              setInput(data.transcription);
            }
          } catch (error) {
            console.error('ASR error:', error);
          }
        };
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (error) {
      console.error('Microphone access error:', error);
    }
  }, [language]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  // Image handling
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        setImageData(data);
        setImagePreview(data);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageData(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Speak message
  const speakMessage = async (text: string) => {
    try {
      const response = await fetch('/api/agent/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: 'tongtong',
          speed: 1.0
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (error) {
      console.error('TTS error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header - Same style as elderly mode */}
      <header className="bg-yellow-500 text-black p-4 sm:p-5 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Shield className="w-10 h-10 sm:w-12 sm:h-12 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold truncate">{t('appTitle')}</h1>
              <p className="text-sm sm:text-base truncate">
                {modelEngine === 'MODE_GLM' ? 'GLM-4' : 'Qwen 3.5'} • {t('appSubtitle')}
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-center shrink-0">
            <LanguageSelector variant="compact" />
            <Button onClick={onOpenSettings} className="bg-black text-yellow-500 p-3">
              <Settings className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Area - Dark theme */}
      <ScrollArea className="flex-1 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-4">
          {messages.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <Shield className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-yellow-500 mb-4" />
              <h2 className="text-2xl sm:text-3xl text-white font-bold mb-3">{t('welcomeTitle')}</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto text-base sm:text-lg">
                {t('welcomeSubtitle')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
                {[
                  t('chatExample1'),
                  t('chatExample2'),
                  t('chatExample3')
                ].map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(example)}
                    className="p-4 border-2 border-gray-700 rounded-xl hover:border-yellow-500 hover:bg-gray-800 transition-colors text-left bg-gray-900"
                  >
                    <p className="text-gray-300 text-sm sm:text-base">{example}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((message) => {
              const riskInfo = message.analysis?.riskLevel ? riskConfig[message.analysis.riskLevel] : null;
              const RiskIcon = riskInfo?.icon || AlertTriangle;
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "flex",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 sm:p-5",
                      message.role === 'user'
                        ? "bg-yellow-500 text-black"
                        : "bg-gray-800 border border-gray-700 text-white"
                    )}
                  >
                    {/* Image preview for user messages */}
                    {message.role === 'user' && message.imageData && (
                      <div className="mb-3">
                        <img 
                          src={message.imageData} 
                          alt="Uploaded" 
                          className="max-w-full rounded-lg max-h-48 object-contain"
                        />
                      </div>
                    )}
                    
                    <p className="whitespace-pre-wrap text-base sm:text-lg">{message.content}</p>
                    
                    {/* Analysis result for assistant messages */}
                    {message.role === 'assistant' && message.analysis && (
                      <div className="mt-4 space-y-4">
                        {/* Risk Badge */}
                        {riskInfo && (
                          <div className={cn(
                            "inline-flex items-center gap-2 px-4 py-2 rounded-full",
                            riskInfo.bg
                          )}>
                            <RiskIcon className="w-5 h-5 text-white" />
                            <span className="font-bold text-white">{message.analysis.riskLevel}</span>
                          </div>
                        )}

                        {/* Summary */}
                        <p className="font-medium text-lg text-yellow-400">{message.analysis.summary}</p>

                        {/* Details */}
                        <p className="text-gray-300">{message.analysis.details}</p>

                        {/* Recommendations */}
                        {message.analysis.recommendations && message.analysis.recommendations.length > 0 && (
                          <div className="mt-3 p-4 bg-gray-900 rounded-xl border border-gray-700">
                            <p className="font-medium text-yellow-500 mb-3">{t('whatToDo')}</p>
                            <ul className="space-y-2">
                              {message.analysis.recommendations.map((rec, i) => (
                                <li key={i} className="text-gray-300 flex gap-3">
                                  <span className="text-yellow-500 font-bold shrink-0">{i + 1}.</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Speak button */}
                        <Button
                          variant="outline"
                          onClick={() => speakMessage(message.analysis?.speakResponse || message.content)}
                          className="mt-2 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                        >
                          <Volume2 className="w-5 h-5 mr-2" />
                          {t('readAloud')}
                        </Button>
                      </div>
                    )}

                    <p className="text-xs opacity-50 mt-3">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-yellow-500" />
                <span className="text-gray-300">{t('analyzing')}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Image Preview */}
      {imagePreview && (
        <div className="px-4 pb-2 bg-gray-900 shrink-0">
          <div className="max-w-4xl mx-auto relative inline-block">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="max-h-32 rounded-lg border border-gray-700"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-7 w-7 bg-red-500"
              onClick={clearImage}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Input Area - Dark theme */}
      <div className="border-t border-gray-800 bg-gray-900 p-3 sm:p-4 shrink-0">
        <div className="max-w-4xl mx-auto">
          {/* Mode Switch Button - Inside input area on mobile */}
          <div className="mb-3 sm:hidden">
            <Button
              onClick={onSwitchMode}
              className="w-full bg-yellow-500 text-black hover:bg-yellow-400 text-sm py-2"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              {t('switchToElderlyMode')}
            </Button>
          </div>
          
          <div className="flex gap-2 sm:gap-3">
            {/* Image upload */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              title="Upload image"
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white p-3"
            >
              <ImageIcon className="w-5 h-5" />
            </Button>

            {/* Voice input */}
            <Button
              variant={isListening ? "default" : "outline"}
              onClick={isListening ? stopListening : startListening}
              title={isListening ? "Stop recording" : "Voice input"}
              className={cn(
                "p-3",
                isListening 
                  ? "bg-red-500 text-white hover:bg-red-600" 
                  : "bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white"
              )}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>

            {/* Text input */}
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={t('placeholder')}
              className="flex-1 bg-gray-800 border-gray-700 text-white text-base placeholder:text-gray-500 focus:border-yellow-500"
              disabled={isLoading}
            />

            {/* Send button */}
            <Button 
              onClick={sendMessage} 
              disabled={isLoading || (!input.trim() && !imageData)}
              className="bg-yellow-500 text-black hover:bg-yellow-400 p-3"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Footer with mode switch on desktop */}
      <footer className="bg-gray-900 border-t border-gray-800 p-3 text-center shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <p className="text-gray-400 text-xs sm:text-sm">
            {t('poweredBy')} {modelEngine === 'MODE_GLM' ? 'GLM-4' : 'Qwen'} • {t('footer')}
          </p>
          {/* Mode switch button on desktop */}
          <Button
            onClick={onSwitchMode}
            variant="outline"
            className="hidden sm:flex bg-gray-800 border-gray-700 text-white hover:bg-gray-700 text-sm py-1 px-3"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            {t('switchToElderlyMode')}
          </Button>
        </div>
      </footer>
    </div>
  );
}
