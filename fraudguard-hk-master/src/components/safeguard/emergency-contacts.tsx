'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, Users, Phone, MessageCircle, Trash2, Edit2, 
  Check, X, AlertCircle, Loader2, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  platform: string;
  relationship?: string;
  priority: number;
  isActive: boolean;
  _count?: { alerts: number };
}

interface EmergencyContactsProps {
  onContactsChange?: (contacts: EmergencyContact[]) => void;
}

export function EmergencyContacts({ onContactsChange }: EmergencyContactsProps) {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    platform: 'whatsapp',
    relationship: '',
    priority: 1
  });

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    try {
      const response = await fetch('/api/contacts');
      const data = await response.json();
      setContacts(data.contacts || []);
      onContactsChange?.(data.contacts || []);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onContactsChange]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Add contact
  const handleAdd = async () => {
    if (!formData.name || !formData.phone) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        await fetchContacts();
        setShowAddDialog(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to add contact:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Update contact
  const handleUpdate = async () => {
    if (!selectedContact || !formData.name || !formData.phone) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedContact.id, ...formData })
      });
      
      if (response.ok) {
        await fetchContacts();
        setShowEditDialog(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to update contact:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete contact
  const handleDelete = async () => {
    if (!selectedContact) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/contacts?id=${selectedContact.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchContacts();
        setShowDeleteDialog(false);
        setSelectedContact(null);
      }
    } catch (error) {
      console.error('Failed to delete contact:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      platform: 'whatsapp',
      relationship: '',
      priority: 1
    });
    setSelectedContact(null);
  };

  // Open edit dialog
  const openEdit = (contact: EmergencyContact) => {
    setSelectedContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      platform: contact.platform,
      relationship: contact.relationship || '',
      priority: contact.priority
    });
    setShowEditDialog(true);
  };

  // Platform config
  const platformConfig: Record<string, { icon: typeof Phone; color: string; label: string }> = {
    whatsapp: { icon: MessageCircle, color: 'bg-green-500', label: 'WhatsApp' },
    wechat: { icon: MessageCircle, color: 'bg-green-600', label: 'WeChat' },
    sms: { icon: Phone, color: 'bg-blue-500', label: 'SMS' },
    call: { icon: Phone, color: 'bg-purple-500', label: 'Call' }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-yellow-500" />
          <h3 className="font-bold text-white">{t('emergencyContacts') || 'Emergency Contacts'}</h3>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowAddDialog(true);
          }}
          className="bg-yellow-500 text-black hover:bg-yellow-400 text-sm"
        >
          <UserPlus className="w-4 h-4 mr-1" />
          {t('addContact') || 'Add'}
        </Button>
      </div>

      {/* Contact List */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <AlertCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">
            {t('noContacts') || 'No emergency contacts yet. Add family members to receive alerts.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact) => {
            const platform = platformConfig[contact.platform] || platformConfig.whatsapp;
            const PlatformIcon = platform.icon;
            
            return (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    platform.color
                  )}>
                    <PlatformIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{contact.name}</p>
                    <p className="text-gray-400 text-sm">{contact.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {platform.label}
                  </Badge>
                  <Button
                    onClick={() => openEdit(contact)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedContact(contact);
                      setShowDeleteDialog(true);
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {t('addEmergencyContact') || 'Add Emergency Contact'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">{t('name') || 'Name'}</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('namePlaceholder') || 'e.g., 媽咪, 阿仔'}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">{t('phone') || 'Phone'}</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+852 1234 5678"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">{t('platform') || 'Platform'}</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(platformConfig).map(([key, config]) => (
                  <Button
                    key={key}
                    onClick={() => setFormData({ ...formData, platform: key })}
                    variant={formData.platform === key ? 'default' : 'outline'}
                    className={cn(
                      "justify-start",
                      formData.platform === key ? "bg-yellow-500 text-black" : "border-gray-700 text-gray-300"
                    )}
                  >
                    <config.icon className="w-4 h-4 mr-2" />
                    {config.label}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">{t('relationship') || 'Relationship (Optional)'}</label>
              <Input
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                placeholder={t('relationshipPlaceholder') || 'e.g., 兒子, 女兒'}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowAddDialog(false)}
              variant="outline"
              className="border-gray-700 text-gray-300"
            >
              {t('cancel') || 'Cancel'}
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!formData.name || !formData.phone || isSaving}
              className="bg-yellow-500 text-black hover:bg-yellow-400"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('save') || 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {t('editContact') || 'Edit Contact'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">{t('name') || 'Name'}</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">{t('phone') || 'Phone'}</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">{t('platform') || 'Platform'}</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(platformConfig).map(([key, config]) => (
                  <Button
                    key={key}
                    onClick={() => setFormData({ ...formData, platform: key })}
                    variant={formData.platform === key ? 'default' : 'outline'}
                    className={cn(
                      "justify-start",
                      formData.platform === key ? "bg-yellow-500 text-black" : "border-gray-700 text-gray-300"
                    )}
                  >
                    <config.icon className="w-4 h-4 mr-2" />
                    {config.label}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">{t('relationship') || 'Relationship'}</label>
              <Input
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowEditDialog(false)}
              variant="outline"
              className="border-gray-700 text-gray-300"
            >
              {t('cancel') || 'Cancel'}
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!formData.name || !formData.phone || isSaving}
              className="bg-yellow-500 text-black hover:bg-yellow-400"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('save') || 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gray-900 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              {t('deleteContact') || 'Delete Contact?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {t('deleteContactConfirm') || `Are you sure you want to remove ${selectedContact?.name} from emergency contacts?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-700 text-gray-300">
              {t('cancel') || 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('delete') || 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default EmergencyContacts;
