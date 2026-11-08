"use client";

import { Loader2 } from 'lucide-react';

export function Spinner({ className = '', size = 'sm' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };
  return (
    <Loader2 className={`${className} animate-spin`.trim()} size={sizes[size]} />
  );
}

export function PageSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[300px] gap-2 ${className}`}>
      <Spinner size="lg" />
      <p className="text-muted-foreground text-sm">Carregando...</p>
    </div>
  );
}
