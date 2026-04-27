'use client';

import { useState, useCallback, useSyncExternalStore } from 'react';
import { ElderlyMode } from '@/components/safeguard/elderly-mode';
import { DefaultMode } from '@/components/safeguard/default-mode';
import { SettingsDialog } from '@/components/safeguard/settings-dialog';
import { ModelEngine, UserMode } from '@/lib/app-config';
import { useTranslation } from '@/lib/i18n';

// Simple localStorage store using useSyncExternalStore
function createLocalStorageStore<T>(key: string, defaultValue: T, validValues?: T[]) {
  let listeners: Array<() => void> = [];

  const getSnapshot = (): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const saved = localStorage.getItem(key);
      if (saved && (!validValues || validValues.includes(saved as T))) {
        return saved as T;
      }
    } catch {
      // localStorage might not be available
    }
    return defaultValue;
  };

  const getServerSnapshot = (): T => defaultValue;

  const subscribe = (listener: () => void) => {
    listeners.push(listener);
    // Also listen to storage events for cross-tab sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key) {
        listeners.forEach(l => l());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      listeners = listeners.filter(l => l !== listener);
      window.removeEventListener('storage', handleStorage);
    };
  };

  const setValue = (value: T) => {
    try {
      localStorage.setItem(key, value as string);
      listeners.forEach(l => l());
    } catch {
      // localStorage might not be available
    }
  };

  return { getSnapshot, getServerSnapshot, subscribe, setValue };
}

// Create stores for user mode and model engine
const userModeStore = createLocalStorageStore<UserMode>('safeguard_mode', 'ELDERLY', ['ELDERLY', 'DEFAULT']);
const modelEngineStore = createLocalStorageStore<ModelEngine>('safeguard_engine', 'MODE_GLM', ['MODE_GLM', 'MODE_QWEN']);

// Hydration detection store
function createHydrationStore() {
  const getSnapshot = () => typeof window !== 'undefined';
  const getServerSnapshot = () => false;
  const subscribe = () => () => {};
  
  return { getSnapshot, getServerSnapshot, subscribe };
}

const hydrationStore = createHydrationStore();

export default function Home() {
  const { t } = useTranslation();
  
  // Use sync external store for localStorage values
  const userMode = useSyncExternalStore(
    userModeStore.subscribe,
    userModeStore.getSnapshot,
    userModeStore.getServerSnapshot
  );
  
  const modelEngine = useSyncExternalStore(
    modelEngineStore.subscribe,
    modelEngineStore.getSnapshot,
    modelEngineStore.getServerSnapshot
  );
  
  const isHydrated = useSyncExternalStore(
    hydrationStore.subscribe,
    hydrationStore.getSnapshot,
    hydrationStore.getServerSnapshot
  );
  
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSwitchMode = useCallback(() => {
    userModeStore.setValue(userMode === 'ELDERLY' ? 'DEFAULT' : 'ELDERLY');
  }, [userMode]);

  const handleModelEngineChange = useCallback((engine: ModelEngine) => {
    modelEngineStore.setValue(engine);
  }, []);

  // Loading state for hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">{t('loading')}</div>
      </div>
    );
  }

  return (
    <>
      {userMode === 'ELDERLY' ? (
        <ElderlyMode
          modelEngine={modelEngine}
          onSwitchMode={handleSwitchMode}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      ) : (
        <DefaultMode
          modelEngine={modelEngine}
          onSwitchMode={handleSwitchMode}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        modelEngine={modelEngine}
        onModelEngineChange={handleModelEngineChange}
      />
    </>
  );
}
