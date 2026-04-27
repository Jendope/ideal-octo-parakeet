'use client';

import { useTranslation, languageNames, Language } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export function LanguageSelector({ variant = 'default', className }: LanguageSelectorProps) {
  const { language, setLanguage, languageName } = useTranslation();

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={cn('gap-2', className)}>
            <Globe className="w-4 h-4" />
            <span>{languageName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {(Object.keys(languageNames) as Language[]).map((lang) => (
            <DropdownMenuItem
              key={lang}
              onClick={() => setLanguage(lang)}
              className={cn(language === lang && 'bg-accent')}
            >
              {languageNames[lang]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Globe className="w-4 h-4 text-muted-foreground" />
      <div className="flex gap-1">
        {(Object.keys(languageNames) as Language[]).map((lang) => (
          <Button
            key={lang}
            variant={language === lang ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setLanguage(lang)}
            className="text-sm"
          >
            {languageNames[lang]}
          </Button>
        ))}
      </div>
    </div>
  );
}
