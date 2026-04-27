'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, Send, X, Users, Phone, MessageCircle, 
  Loader2, Check, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { useAndroidBridge } from '@/hooks/use-android-bridge';

interface FamilyAlertPanelProps {
  riskLevel: string;
  message: string;
  summary?: string;
  onDismiss: () => void;
}

interface AlertResult {
  alertId: string;
  contact: {
    id: string;
    name: string;
    phone: string;
    platform: string;
  };
  shareUrl: string;
  message: string;
}

export function FamilyAlertPanel({ riskLevel, message, summary, onDismiss }: FamilyAlertPanelProps) {
  const { t } = useTranslation();
  const androidBridge = useAndroidBridge();
  const [isSending, setIsSending] = useState(false);
  const [alertResults, setAlertResults] = useState<AlertResult[]>([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sendAlert = async () => {
    setIsSending(true);
    setError(null);
    
    try {
      const response = await fetch('/api/family-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riskLevel, message, summary })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAlertResults(data.results);
        setAlertMessage(data.alertMessage);
      } else {
        setError(data.message || 'Failed to send alert');
      }
    } catch (err) {
      setError('Failed to send alert');
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  // Open share URL - uses Android bridge if available
  const openShareUrl = (result: AlertResult) => {
    if (androidBridge.isReady && androidBridge.bridge) {
      // On Android, open the appropriate app
      if (result.contact.platform === 'whatsapp') {
        androidBridge.openApp('whatsapp');
      } else if (result.contact.platform === 'wechat') {
        androidBridge.openApp('wechat');
      }
    }
    
    // Open share URL in new window
    window.open(result.shareUrl, '_blank');
  };

  const platformConfig: Record<string, { icon: typeof Phone; color: string }> = {
    whatsapp: { icon: MessageCircle, color: 'text-green-500' },
    wechat: { icon: MessageCircle, color: 'text-green-600' },
    sms: { icon: Phone, color: 'text-blue-500' },
    call: { icon: Phone, color: 'text-purple-500' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-red-900/50 border-2 border-red-500 rounded-lg p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {t('familyAlert') || 'Family Alert'}
            </h3>
            <p className="text-sm text-red-200">
              {t('alertDetected') || `${riskLevel === 'critical' ? 'Critical' : 'High'} risk detected`}
            </p>
          </div>
        </div>
        <Button
          onClick={onDismiss}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Alert Status */}
      {alertResults.length === 0 ? (
        <>
          {/* Warning Message */}
          <div className="bg-red-950 rounded-lg p-3">
            <p className="text-white text-sm">
              {t('alertWarning') || 'This message appears to be a scam. Would you like to notify your family members?'}
            </p>
          </div>

          {/* Send Button */}
          <div className="flex gap-2">
            <Button
              onClick={sendAlert}
              disabled={isSending}
              className="flex-1 bg-red-500 text-white hover:bg-red-600"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('sending') || 'Sending...'}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t('notifyFamily') || 'Notify Family'}
                </>
              )}
            </Button>
            <Button
              onClick={onDismiss}
              variant="outline"
              className="border-gray-600 text-gray-300"
            >
              {t('dismiss') || 'Dismiss'}
            </Button>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
        </>
      ) : (
        <>
          {/* Success Message */}
          <div className="bg-green-900/50 rounded-lg p-3 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            <p className="text-green-200 text-sm">
              {t('alertPrepared') || 'Alert prepared! Click below to send to your family.'}
            </p>
          </div>

          {/* Contact Results */}
          <div className="space-y-2">
            {alertResults.map((result) => {
              const platform = platformConfig[result.contact.platform] || platformConfig.whatsapp;
              const PlatformIcon = platform.icon;
              
              return (
                <div
                  key={result.alertId}
                  className="bg-gray-800 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <PlatformIcon className={cn("w-5 h-5", platform.color)} />
                    <div>
                      <p className="text-white font-medium">{result.contact.name}</p>
                      <p className="text-gray-400 text-sm">{result.contact.phone}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => openShareUrl(result)}
                    className="bg-green-500 text-white hover:bg-green-600 text-sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    {t('open') || 'Open'}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Copy Message */}
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-2">{t('alertMessage') || 'Alert Message:'}</p>
            <p className="text-white text-sm whitespace-pre-line">{alertMessage}</p>
          </div>

          {/* Done Button */}
          <Button
            onClick={onDismiss}
            className="w-full bg-gray-700 text-white hover:bg-gray-600"
          >
            {t('done') || 'Done'}
          </Button>
        </>
      )}
    </motion.div>
  );
}

export default FamilyAlertPanel;
