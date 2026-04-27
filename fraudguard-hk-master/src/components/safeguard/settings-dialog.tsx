'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MODEL_CONFIGS, ModelEngine } from '@/lib/app-config';
import { useTranslation } from '@/lib/i18n';
import { LanguageSelector } from './language-selector';
import { Shield, Brain, Volume2, Users, Plus, Trash2, Phone, User } from 'lucide-react';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelEngine: ModelEngine;
  onModelEngineChange: (engine: ModelEngine) => void;
}

export function SettingsDialog({
  open,
  onOpenChange,
  modelEngine,
  onModelEngineChange
}: SettingsDialogProps) {
  const { t } = useTranslation();
  const [localModelEngine, setLocalModelEngine] = useState<ModelEngine>(modelEngine);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [slowerSpeech, setSlowerSpeech] = useState(true);
  
  // Emergency contacts state
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });

  const handleSave = () => {
    onModelEngineChange(localModelEngine);
    onOpenChange(false);
  };

  const handleAddContact = () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) return;
    
    const contact: EmergencyContact = {
      id: Date.now().toString(),
      ...newContact
    };
    setContacts(prev => [...prev, contact]);
    setNewContact({ name: '', phone: '', relationship: '' });
    setShowAddContact(false);
  };

  const handleRemoveContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] p-0 gap-0">
        {/* Fixed Header */}
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Shield className="w-7 h-7" />
            {t('settingsTitle')}
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            {t('settingsDescription')}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 overflow-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <div className="p-6 space-y-8">
            {/* Language Selection */}
            <div className="space-y-4">
              <Label className="text-xl font-semibold">{t('language')}</Label>
              <LanguageSelector />
              <p className="text-sm text-muted-foreground">
                {t('languageAutoDetect') || 'Voice input will automatically use selected language'}
              </p>
            </div>

            <Separator className="my-6" />

            {/* Model Engine Selection */}
            <div className="space-y-4">
              <Label className="text-xl font-semibold flex items-center gap-2">
                <Brain className="w-5 h-5" />
                {t('aiEngine')}
              </Label>
              <p className="text-base text-muted-foreground">
                {t('aiEngineDescription')}
              </p>
              <RadioGroup
                value={localModelEngine}
                onValueChange={(value) => setLocalModelEngine(value as ModelEngine)}
                className="space-y-4"
              >
                {/* GLM Option */}
                <div 
                  className={`flex items-start gap-5 p-5 rounded-xl border cursor-pointer transition-colors ${
                    localModelEngine === 'MODE_GLM' ? 'bg-accent border-primary' : 'hover:bg-accent/50'
                  }`}
                  onClick={() => setLocalModelEngine('MODE_GLM')}
                >
                  <RadioGroupItem value="MODE_GLM" id="glm" className="mt-1 shrink-0 w-5 h-5" />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor="glm" className="font-medium cursor-pointer text-lg">
                      {t('glmEngine')}
                    </Label>
                    <p className="text-base text-muted-foreground mt-2">
                      {t('glmDescription')}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        {t('bestForPlanning')}
                      </span>
                      <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                        {t('visionCapable')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Qwen Option */}
                <div 
                  className={`flex items-start gap-5 p-5 rounded-xl border cursor-pointer transition-colors ${
                    localModelEngine === 'MODE_QWEN' ? 'bg-accent border-primary' : 'hover:bg-accent/50'
                  }`}
                  onClick={() => setLocalModelEngine('MODE_QWEN')}
                >
                  <RadioGroupItem value="MODE_QWEN" id="qwen" className="mt-1 shrink-0 w-5 h-5" />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor="qwen" className="font-medium cursor-pointer text-lg">
                      {t('qwenEngine')}
                    </Label>
                    <p className="text-base text-muted-foreground mt-2">
                      {t('qwenDescription')}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                        {t('fastResponse')}
                      </span>
                      <span className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                        {t('ocrCapable')}
                      </span>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <Separator className="my-6" />

            {/* Voice Settings */}
            <div className="space-y-5">
              <Label className="text-xl font-semibold flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                {t('voiceSettings')}
              </Label>
              <div className="flex items-center justify-between gap-4 py-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-lg">{t('autoSpeakResponses')}</p>
                  <p className="text-base text-muted-foreground mt-1">
                    {t('autoSpeakDescription')}
                  </p>
                </div>
                <Switch 
                  checked={autoSpeak} 
                  onCheckedChange={setAutoSpeak}
                  className="shrink-0 scale-110" 
                />
              </div>
              <div className="flex items-center justify-between gap-4 py-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-lg">{t('slowerSpeech')}</p>
                  <p className="text-base text-muted-foreground mt-1">
                    {t('slowerSpeechDescription')}
                  </p>
                </div>
                <Switch 
                  checked={slowerSpeech} 
                  onCheckedChange={setSlowerSpeech}
                  className="shrink-0 scale-110" 
                />
              </div>
            </div>

            <Separator className="my-6" />

            {/* Emergency Contacts */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xl font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {t('emergencyContacts')}
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddContact(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('addContact') || 'Add'}
                </Button>
              </div>
              
              <p className="text-base text-muted-foreground">
                {t('emergencyContactsDescription') || 'Family members will be notified when high-risk scams are detected'}
              </p>

              {/* Add Contact Form */}
              {showAddContact && (
                <div className="p-4 border rounded-xl space-y-4 bg-muted/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">{t('contactName') || 'Name'}</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          value={newContact.name}
                          onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                          placeholder={t('contactNamePlaceholder') || 'e.g., Mom'}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">{t('contactPhone') || 'Phone'}</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          value={newContact.phone}
                          onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+852 1234 5678"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">{t('contactRelationship') || 'Relationship'}</Label>
                    <Input
                      value={newContact.relationship}
                      onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                      placeholder={t('contactRelationshipPlaceholder') || 'e.g., Family, Friend'}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => setShowAddContact(false)}>
                      {t('cancel')}
                    </Button>
                    <Button size="sm" onClick={handleAddContact} disabled={!newContact.name.trim() || !newContact.phone.trim()}>
                      {t('addContact') || 'Add'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Contact List */}
              {contacts.length > 0 ? (
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <div 
                      key={contact.id}
                      className="flex items-center justify-between p-4 border rounded-xl bg-card"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-lg">{contact.name}</p>
                          <p className="text-sm text-muted-foreground">{contact.phone}</p>
                          {contact.relationship && (
                            <p className="text-xs text-muted-foreground">{contact.relationship}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveContact(contact.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : !showAddContact && (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg">{t('noContacts') || 'No emergency contacts yet'}</p>
                  <p className="text-sm mt-1">{t('addContactHint') || 'Click "Add" to add a contact'}</p>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* About Section */}
            <div className="space-y-3 text-base text-muted-foreground">
              <p className="font-medium text-foreground text-lg">{t('about')}</p>
              <p>{t('aboutDescription')}</p>
              <p>{t('aboutModes')}</p>
            </div>
          </div>
        </ScrollArea>

        {/* Fixed Footer */}
        <div className="p-5 border-t flex justify-end gap-4 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-lg py-3 px-6">
            {t('cancel')}
          </Button>
          <Button onClick={handleSave} className="text-lg py-3 px-6">
            {t('saveChanges')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
