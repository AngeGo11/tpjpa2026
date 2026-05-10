import React from 'react';
import type { UserTicketView } from '../services/userTicketsService';
import { FestigoLogo } from './festigo-logo';

/** QR statique affiché sur la plateforme (variante marque — même payload scan que le billet). */
export const ENTRY_QR_SRC = new URL('../../images/qr_code_entree.png', import.meta.url).href;
export const ENTRY_QR_SRC_PLATFORME = new URL('../../images/qr_code_plateforme.png', import.meta.url).href;

function categoryAccent(ticketType: string): { badgeClass: string; shadowClass: string } {
  if (ticketType === 'VVIP') {
    return {
      badgeClass: 'bg-violet-600 text-white',
      shadowClass: 'shadow-[0_4px_16px_rgba(124,58,237,0.35)]',
    };
  }
  if (ticketType === 'VIP') {
    return {
      badgeClass: 'bg-festigo text-white',
      shadowClass: 'shadow-[0_4px_16px_rgba(18,84,132,0.35)]',
    };
  }
  return {
    badgeClass: 'bg-slate-900 text-white',
    shadowClass: 'shadow-[0_4px_16px_rgba(15,23,42,0.3)]',
  };
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0" />
    </svg>
  );
}

function ClockIconSmall() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CalIconSmall() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}


export interface FestigoDigitalPassProps {
  ticket: UserTicketView;
  holderName: string;
  className?: string;
}

/**
 * Carte billet numérique FestiGo — même QR statique partout (`ENTRY_QR_SRC`).
 */
export function FestigoDigitalPass({ ticket, holderName, className = '' }: FestigoDigitalPassProps) {
  const { badgeClass, shadowClass } = categoryAccent(ticket.ticketType);
  const weekdayShort = new Date(ticket.eventMs).toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase();

  const orderShort = ticket.orderNumber.replace(/^#CMD-/, '');

  return (
    <div
      className={`w-full max-w-[420px] rounded-[28px] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.15),0_20px_60px_-10px_rgba(0,0,0,0.25)] ring-1 ring-black/5 ${className}`}
    >
      {/* Bandeau */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-festigo to-[#0e4a6e] px-[22px] pb-[18px] pt-5">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.06) 10px, rgba(255,255,255,0.06) 20px)`,
          }}
        />
        <div className="absolute -right-10 -top-10 h-[140px] w-[140px] rounded-full border border-amber-500/20 bg-amber-500/15" />
        <div className="absolute -right-2.5 -top-2.5 h-20 w-20 rounded-full bg-amber-500/12" />

        <div className="relative z-[1] flex items-start justify-between">
          <div className="flex flex-col items-start">
            <div className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
              {ticket.monthShort} · {ticket.yearStr}
            </div>
            <div className="font-black leading-[0.9] tracking-[-0.08em] text-white" style={{ fontSize: '52px' }}>
              {ticket.dayNum}
            </div>
            <div className="mt-0.5 font-mono text-[11px] tracking-wide text-white/40">{weekdayShort}</div>
          </div>
          <div className="flex flex-col items-end gap-2.5">
            <FestigoLogo
              variant="onDark"
              className="h-7 max-h-8 max-w-[48px]"
              wordmarkClassName="text-sm font-bold"
            />
            
          </div>
        </div>
      </div>

      {/* Corps */}
      <div className="px-[22px] pt-5">
        <h2 className="text-[22px] font-extrabold leading-[1.15] tracking-tight text-slate-900">{ticket.eventName}</h2>

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
            <span className="shrink-0 text-festigo">
              <PinIcon />
            </span>
            {ticket.venue}
          </div>
          <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
            <span className="shrink-0 text-festigo">
              <ClockIconSmall />
            </span>
            {ticket.timeLabel}
          </div>
          <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
            <span className="shrink-0 text-festigo">
              <CalIconSmall />
            </span>
            {ticket.dateLabel}
          </div>
        </div>
      </div>

      {/* Perforation */}
      <div className="mt-5 px-3.5">
        <hr className="border-0 border-t-2 border-dashed border-slate-200" />
      </div>

      {/* Talon + QR */}
      <div className="flex flex-col gap-4 px-[22px] pb-5 pt-[18px] sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1 space-y-2">
          <div
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[13px] font-extrabold tracking-wide ${badgeClass} ${shadowClass}`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {ticket.ticketType}
          </div>

          <div className="mt-2 flex gap-5">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Commande</div>
              <div className="font-mono text-[11px] text-slate-600">{orderShort}</div>
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Réf. billet</div>
              <div className="font-mono text-[11px] text-slate-600">#{ticket.id}</div>
            </div>
          </div>

          <div className="pt-1">
            <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Code billet</div>
            <div className="break-all font-mono text-[10px] text-slate-400">{ticket.qrCode}</div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-1 sm:w-auto">
          <div className="relative rounded-[14px] border-[1.5px] border-slate-200 bg-white p-2.5 shadow-sm">
            <div className="pointer-events-none absolute left-1 top-1 h-3.5 w-3.5 rounded-tl border-l-2 border-t-2 border-festigo" />
            <div className="pointer-events-none absolute right-1 top-1 h-3.5 w-3.5 rounded-tr border-r-2 border-t-2 border-festigo" />
            <div className="pointer-events-none absolute bottom-1 left-1 h-3.5 w-3.5 rounded-bl border-b-2 border-l-2 border-festigo" />
            <div className="pointer-events-none absolute bottom-1 right-1 h-3.5 w-3.5 rounded-br border-b-2 border-r-2 border-festigo" />
            <img
              src={ENTRY_QR_SRC}
              width={130}
              height={130}
              alt=""
              className="block h-[130px] w-[130px] object-contain"
            />
          </div>
          <div className="max-w-[140px] text-center font-mono text-[8.5px] tracking-wide text-slate-400">
            {ticket.qrCode.length > 24 ? `${ticket.qrCode.slice(0, 12)}…` : ticket.qrCode}
          </div>
          <div className="text-center text-[9.5px] font-medium text-slate-400">Scan à l&apos;entrée</div>
        </div>
      </div>

      {/* Pied */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/90 px-[22px] py-3">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Titulaire</div>
          <div className="text-[13px] font-bold text-slate-800">{holderName}</div>
        </div>
        <div className="text-right font-mono text-[10.5px] text-slate-500">Entrée principale</div>
      </div>

      <style>{`
        @keyframes festigo-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}

/** Bloc QR compact pour la liste des billets (même image que le billet complet). */
export function FestigoEntryQrThumb({ className = 'h-28 w-28' }: { className?: string }) {
  return (
    <img
      src={ENTRY_QR_SRC_PLATFORME}
      alt=""
      width={112}
      height={112}
      className={`object-contain ${className}`}
    />
  );
}
