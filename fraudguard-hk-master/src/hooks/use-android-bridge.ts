'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Custom hook for Android WebView Bridge integration
 * Detects if running in Android WebView and provides bridge methods
 */

interface AndroidBridge {
  isAndroid: () => boolean;
  hasPermission: (permission: string) => boolean;
  showToast: (message: string) => void;
  startVoiceRecognition: (callback: string) => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  makeCall: (phoneNumber: string) => boolean;
  openDialer: (phoneNumber: string) => boolean;
  sendSMS: (phoneNumber: string, message: string) => boolean;
  openSMS: (phoneNumber: string, message: string) => boolean;
  openApp: (appNameOrPackage: string) => boolean;
  isAppInstalled: (packageName: string) => boolean;
  pickContact: (callback: string) => void;
  searchContacts: (query: string) => string;
  searchWeb: (query: string) => boolean;
  openUrl: (url: string) => boolean;
  setAlarm: (hour: number, minute: number, message: string) => boolean;
  addCalendarEvent: (title: string, description: string, beginTime: number) => boolean;
  openCamera: () => boolean;
  openGallery: () => boolean;
  openSettings: () => boolean;
  openAppSettings: () => boolean;
  blockNumber: (phoneNumber: string) => boolean;
  checkSuspiciousNumber: (phoneNumber: string) => string;
  executeAutonomousAction: (actionJson: string) => string;
  getDeviceInfo: () => string;
}

// Extend Window interface
declare global {
  interface Window {
    AndroidBridge?: AndroidBridge;
    isAndroidApp?: boolean;
    onAndroidBridgeReady?: () => void;
  }
}

export interface UseAndroidBridgeResult {
  isAndroid: boolean;
  isReady: boolean;
  bridge: AndroidBridge | null;
  
  // Convenience methods
  speak: (text: string) => void;
  openApp: (appName: string) => boolean;
  makeCall: (phoneNumber: string) => boolean;
  sendSMS: (phoneNumber: string, message: string) => boolean;
  searchWeb: (query: string) => boolean;
  executeAction: (action: {
    type: string;
    app_name?: string;
    phone_number?: string;
    message?: string;
    query?: string;
    hour?: number;
    minute?: number;
  }) => { success: boolean; error?: string };
}

export function useAndroidBridge(): UseAndroidBridgeResult {
  const [isReady, setIsReady] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if Android bridge is available
    const checkBridge = () => {
      if (typeof window !== 'undefined' && window.AndroidBridge) {
        setIsAndroid(true);
        setIsReady(true);
      } else if (typeof window !== 'undefined' && window.isAndroidApp) {
        setIsAndroid(true);
        // Bridge might be injected but not ready yet
        const interval = setInterval(() => {
          if (window.AndroidBridge) {
            setIsReady(true);
            clearInterval(interval);
          }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => clearInterval(interval), 5000);
      }
    };

    checkBridge();

    // Listen for bridge ready event
    window.onAndroidBridgeReady = () => {
      checkBridge();
    };

    return () => {
      window.onAndroidBridgeReady = undefined;
    };
  }, []);

  const bridge = isReady && window.AndroidBridge ? window.AndroidBridge : null;

  // Speak text using Android TTS or fallback
  const speak = useCallback((text: string) => {
    if (bridge) {
      bridge.speak(text);
    } else {
      // Fallback to Web Speech API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-HK';
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [bridge]);

  // Open app
  const openApp = useCallback((appName: string): boolean => {
    if (bridge) {
      return bridge.openApp(appName);
    }
    console.log('Android bridge not available - cannot open app:', appName);
    return false;
  }, [bridge]);

  // Make phone call
  const makeCall = useCallback((phoneNumber: string): boolean => {
    if (bridge) {
      return bridge.makeCall(phoneNumber);
    }
    // Fallback: open tel: link
    window.location.href = `tel:${phoneNumber}`;
    return true;
  }, [bridge]);

  // Send SMS
  const sendSMS = useCallback((phoneNumber: string, message: string): boolean => {
    if (bridge) {
      return bridge.sendSMS(phoneNumber, message);
    }
    // Fallback: open SMS link
    window.location.href = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
    return true;
  }, [bridge]);

  // Search web
  const searchWeb = useCallback((query: string): boolean => {
    if (bridge) {
      return bridge.searchWeb(query);
    }
    // Fallback: open Google search
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    return true;
  }, [bridge]);

  // Execute autonomous action
  const executeAction = useCallback((action: {
    type: string;
    app_name?: string;
    phone_number?: string;
    message?: string;
    query?: string;
    hour?: number;
    minute?: number;
  }): { success: boolean; error?: string } => {
    if (bridge) {
      try {
        const result = bridge.executeAutonomousAction(JSON.stringify(action));
        const parsed = JSON.parse(result);
        return { success: parsed.success, error: parsed.error };
      } catch (e) {
        return { success: false, error: String(e) };
      }
    }
    
    // Web fallback based on action type
    switch (action.type) {
      case 'open_app':
        return { success: false, error: '請使用 Android 應用程式打開 App' };
      case 'make_call':
        if (action.phone_number) {
          window.location.href = `tel:${action.phone_number}`;
          return { success: true };
        }
        return { success: false, error: '沒有提供電話號碼' };
      case 'send_message':
        if (action.phone_number) {
          window.location.href = `sms:${action.phone_number}?body=${encodeURIComponent(action.message || '')}`;
          return { success: true };
        }
        return { success: false, error: '沒有提供電話號碼' };
      case 'search_web':
        if (action.query) {
          window.open(`https://www.google.com/search?q=${encodeURIComponent(action.query)}`, '_blank');
          return { success: true };
        }
        return { success: false, error: '沒有提供搜尋內容' };
      default:
        return { success: false, error: '不支援的操作' };
    }
  }, [bridge]);

  return {
    isAndroid,
    isReady,
    bridge,
    speak,
    openApp,
    makeCall,
    sendSMS,
    searchWeb,
    executeAction,
  };
}

export default useAndroidBridge;
