/**
 * ModeManager - Manages UI mode switching between Elderly and Default modes
 * Handles persistence and state management for user preferences
 */

import { UserMode, appConfig } from './app-config';

// Mode Configuration Interface
export interface ModeConfig {
  mode: UserMode;
  voiceEnabled: boolean;
  textSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  simplifiedUI: boolean;
  autoSpeak: boolean;
  buttonSize: 'normal' | 'large' | 'massive';
}

// Elderly Mode Configuration
export const ELDERLY_MODE_CONFIG: ModeConfig = {
  mode: 'ELDERLY',
  voiceEnabled: true,
  textSize: 'extra-large',
  highContrast: true,
  simplifiedUI: true,
  autoSpeak: true,
  buttonSize: 'massive'
};

// Default Mode Configuration
export const DEFAULT_MODE_CONFIG: ModeConfig = {
  mode: 'DEFAULT',
  voiceEnabled: false,
  textSize: 'normal',
  highContrast: false,
  simplifiedUI: false,
  autoSpeak: false,
  buttonSize: 'normal'
};

// Mode Manager Class
export class ModeManager {
  private static instance: ModeManager;
  private currentMode: UserMode;
  private modeConfig: ModeConfig;

  private constructor() {
    // Default to ELDERLY mode on install (as per requirements)
    this.currentMode = 'ELDERLY';
    this.modeConfig = { ...ELDERLY_MODE_CONFIG };
  }

  // Singleton Pattern
  public static getInstance(): ModeManager {
    if (!ModeManager.instance) {
      ModeManager.instance = new ModeManager();
    }
    return ModeManager.instance;
  }

  // Get Current Mode
  public getCurrentMode(): UserMode {
    return this.currentMode;
  }

  // Get Current Mode Configuration
  public getModeConfig(): ModeConfig {
    return { ...this.modeConfig };
  }

  // Switch to Elderly Mode
  public switchToElderlyMode(): void {
    this.currentMode = 'ELDERLY';
    this.modeConfig = { ...ELDERLY_MODE_CONFIG };
    appConfig.setUserMode('ELDERLY');
    appConfig.setHighContrast(true);
    appConfig.setFontSize('extra-large');
  }

  // Switch to Default Mode
  public switchToDefaultMode(): void {
    this.currentMode = 'DEFAULT';
    this.modeConfig = { ...DEFAULT_MODE_CONFIG };
    appConfig.setUserMode('DEFAULT');
    appConfig.setHighContrast(false);
    appConfig.setFontSize('normal');
  }

  // Toggle Mode
  public toggleMode(): UserMode {
    if (this.currentMode === 'ELDERLY') {
      this.switchToDefaultMode();
    } else {
      this.switchToElderlyMode();
    }
    return this.currentMode;
  }

  // Check if Elderly Mode
  public isElderlyMode(): boolean {
    return this.currentMode === 'ELDERLY';
  }

  // Check if Default Mode
  public isDefaultMode(): boolean {
    return this.currentMode === 'DEFAULT';
  }

  // Update Mode Configuration
  public updateModeConfig(config: Partial<ModeConfig>): void {
    this.modeConfig = { ...this.modeConfig, ...config };
  }

  // Get Text Size Classes for Tailwind
  public getTextSizeClasses(): string {
    switch (this.modeConfig.textSize) {
      case 'extra-large':
        return 'text-2xl';
      case 'large':
        return 'text-xl';
      default:
        return 'text-base';
    }
  }

  // Get Button Size Classes for Tailwind
  public getButtonSizeClasses(): string {
    switch (this.modeConfig.buttonSize) {
      case 'massive':
        return 'text-3xl py-8 px-12 min-h-[120px]';
      case 'large':
        return 'text-xl py-4 px-8 min-h-[80px]';
      default:
        return 'text-base py-2 px-4 min-h-[44px]';
    }
  }

  // Get High Contrast Classes
  public getHighContrastClasses(): string {
    if (this.modeConfig.highContrast) {
      return 'bg-black text-white border-4 border-white';
    }
    return 'bg-background text-foreground';
  }

  // Serialize for storage
  public serialize(): string {
    return JSON.stringify({
      currentMode: this.currentMode,
      modeConfig: this.modeConfig
    });
  }

  // Deserialize from storage
  public deserialize(data: string): void {
    try {
      const parsed = JSON.parse(data);
      this.currentMode = parsed.currentMode;
      this.modeConfig = parsed.modeConfig;
      appConfig.setUserMode(this.currentMode);
    } catch (error) {
      console.error('Failed to deserialize mode config:', error);
    }
  }
}

// Export singleton instance
export const modeManager = ModeManager.getInstance();

// React Hook for Mode Management (client-side)
export function useModeManager() {
  const getCurrentMode = (): UserMode => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('safeguard_mode');
      if (stored === 'ELDERLY' || stored === 'DEFAULT') {
        return stored;
      }
    }
    return 'ELDERLY'; // Default for new installations
  };

  const setCurrentMode = (mode: UserMode): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('safeguard_mode', mode);
    }
  };

  const getModeConfig = (): ModeConfig => {
    const mode = getCurrentMode();
    return mode === 'ELDERLY' ? ELDERLY_MODE_CONFIG : DEFAULT_MODE_CONFIG;
  };

  return {
    getCurrentMode,
    setCurrentMode,
    getModeConfig,
    isElderlyMode: () => getCurrentMode() === 'ELDERLY',
    isDefaultMode: () => getCurrentMode() === 'DEFAULT',
    toggleMode: () => {
      const current = getCurrentMode();
      const newMode: UserMode = current === 'ELDERLY' ? 'DEFAULT' : 'ELDERLY';
      setCurrentMode(newMode);
      return newMode;
    }
  };
}
