import React from 'react';
import { cn } from './ui/utils';

export const FESTIGO_LOGO_SRC = new URL('../../images/logoFG.png', import.meta.url).href;

export interface FestigoLogoProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /**
   * `onDark` : fond blanc léger pour lisibilité sur dégradés / fonds bleus (bannières auth, bandeau billet).
   */
  variant?: 'default' | 'onDark';
  /** Affiche la mention « FestiGo » à droite du pictogramme. */
  wordmark?: boolean;
  /** Classes Tailwind pour le texte FestiGo (taille, etc.). */
  wordmarkClassName?: string;
}

function FestigoWordmark({ className }: { className?: string }) {
  return (
    <span className={cn('select-none whitespace-nowrap font-bold tracking-tight text-slate-900', className)}>
      Festi<span className="text-festigo">Go</span>
    </span>
  );
}

export function FestigoLogo({
  variant = 'default',
  wordmark = true,
  wordmarkClassName,
  className,
  alt,
  ...rest
}: FestigoLogoProps) {
  const imgDecorative = Boolean(wordmark);

  const img = (
    <img
      src={FESTIGO_LOGO_SRC}
      alt={imgDecorative ? '' : alt ?? 'FestiGo'}
      aria-hidden={imgDecorative || undefined}
      draggable={false}
      className={cn(
        'shrink-0 object-contain object-left',
        wordmark ? 'h-8 max-w-[56px] sm:max-w-[64px]' : 'h-8 max-w-[200px]',
        className
      )}
      {...rest}
    />
  );

  const wordmarkEl =
    wordmark === true ? (
      <FestigoWordmark className={cn('text-base sm:text-lg', wordmarkClassName)} />
    ) : null;

  if (variant === 'onDark') {
    return (
      <span className="inline-flex max-w-full items-center gap-2 rounded-xl bg-white/95 px-2.5 py-1.5 shadow-sm ring-1 ring-black/10">
        {img}
        {wordmarkEl}
      </span>
    );
  }

  if (wordmark) {
    return (
      <span className="inline-flex max-w-full items-center gap-2">
        {img}
        {wordmarkEl}
      </span>
    );
  }

  return img;
}
