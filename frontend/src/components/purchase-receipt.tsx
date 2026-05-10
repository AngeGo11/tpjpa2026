import React from 'react';
import type { GenreMusical } from '../services/eventService';
import { FestigoLogo } from './festigo-logo';

export type ReceiptItemCategory = 'GP' | 'VIP' | 'VVIP';

export interface PurchaseReceiptItem {
  description: string;
  category: ReceiptItemCategory;
  qty: number;
  unitPrice: number;
}

export interface PurchaseReceiptProps {
  orderId: string;
  /** Référence affichée sur le récap (#id serveur), ex. #42 */
  internalReference?: string;
  purchaseDate: string;
  purchaseTime: string;
  paymentMethod: string;
  /** Aligné sur le bloc « Informations » du récapitulatif */
  buyerName?: string;
  buyerEmail?: string;
  eventTitle: string;
  eventSubtitle?: string;
  venue: string;
  eventDate: string;
  eventTime: string;
  items: PurchaseReceiptItem[];
  subtotal: number;
  serviceFee: number;
  total: number;
}

const eur = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

function categoryBadge(cat: ReceiptItemCategory) {
  const map: Record<
    ReceiptItemCategory,
    { className: string; label: string }
  > = {
    VIP: { className: 'bg-amber-100 text-amber-800 ring-amber-200/80', label: 'VIP' },
    VVIP: { className: 'bg-festigo/15 text-festigo ring-festigo/25', label: 'VVIP' },
    GP: { className: 'bg-slate-100 text-slate-700 ring-slate-200/80', label: 'Grand public' },
  };
  const s = map[cat];
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${s.className}`}
    >
      {s.label}
    </span>
  );
}

export function mapLibelleToReceiptCategory(libelle: string): ReceiptItemCategory {
  if (libelle.includes('VVIP')) return 'VVIP';
  if (libelle.includes('VIP')) return 'VIP';
  return 'GP';
}

export function genreLabel(g: GenreMusical | undefined): string | undefined {
  if (!g) return undefined;
  return g.replace(/_/g, ' ');
}

/**
 * Reçu d’achat (aperçu ou impression). Couleurs alignées sur la charte FestiGo — sans QR code.
 */
export function PurchaseReceiptCard({
  orderId,
  internalReference,
  purchaseDate,
  purchaseTime,
  paymentMethod,
  buyerName,
  buyerEmail,
  eventTitle,
  eventSubtitle,
  venue,
  eventDate,
  eventTime,
  items,
  subtotal,
  serviceFee,
  total,
}: PurchaseReceiptProps) {
  const showBuyer = Boolean(buyerName || buyerEmail);
  const showInfoBlock = Boolean(internalReference || showBuyer);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
      <div className="h-1 bg-festigo" aria-hidden />

      <div className="flex flex-wrap items-start justify-between gap-5 border-b border-slate-100 px-6 py-7 sm:px-10">
        <div className="flex flex-col gap-1.5">
          <FestigoLogo
            className="h-11 max-w-[72px] sm:h-12 sm:max-w-[80px]"
            wordmarkClassName="text-xl font-bold sm:text-2xl"
          />
          <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-slate-500">Billetterie</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tracking-tight text-slate-900">REÇU</p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden />
            Paiement confirmé
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 border-b border-slate-100 px-6 py-6 sm:grid-cols-3 sm:px-10">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">N° commande</p>
          <p className="mt-1 font-mono text-sm font-medium text-slate-900">{orderId}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Date d&apos;achat</p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {purchaseDate} · {purchaseTime}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Paiement</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{paymentMethod}</p>
        </div>
      </div>

      {showInfoBlock ? (
        <div className="border-b border-slate-100 px-6 py-6 sm:px-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Informations</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {internalReference ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Référence</p>
                <p className="mt-1 font-mono text-sm font-semibold text-slate-900">{internalReference}</p>
              </div>
            ) : null}
            {showBuyer ? (
              <div className={internalReference ? '' : 'sm:col-span-2'}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Acheteur</p>
                {buyerName ? <p className="mt-1 text-sm font-medium text-slate-900">{buyerName}</p> : null}
                {buyerEmail ? <p className="text-xs text-slate-500">{buyerEmail}</p> : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="border-b border-slate-100 px-6 py-6 sm:px-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Événement</p>
        <div className="mt-3 rounded-xl border border-festigo/20 bg-festigo/[0.06] px-5 py-5">
          <h3 className="text-lg font-bold tracking-tight text-slate-900">{eventTitle}</h3>
          {eventSubtitle ? (
            <p className="mt-1 text-sm font-semibold text-amber-600">{eventSubtitle}</p>
          ) : null}
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p className="flex items-start gap-2">
              <span className="mt-0.5 font-semibold text-festigo">▸</span>
              {venue}
            </p>
            <p className="flex items-start gap-2">
              <span className="mt-0.5 font-semibold text-festigo">▸</span>
              {eventDate}
            </p>
            <p className="flex items-start gap-2">
              <span className="mt-0.5 font-semibold text-festigo">▸</span>
              {eventTime}
            </p>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-100 px-6 sm:px-10">
        <div className="pt-5 pb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Détail</p>
        </div>
        <div className="hidden grid-cols-[1fr_48px_88px_88px] gap-2 border-b-2 border-slate-200 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:grid">
          <span>Catégorie</span>
          <span className="text-right">Qté</span>
          <span className="text-right">Prix unit.</span>
          <span className="text-right">Sous-total</span>
        </div>
        <div className="divide-y divide-slate-100">
          {items.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-1 gap-2 py-3 sm:grid-cols-[1fr_48px_88px_88px] sm:items-center"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-slate-900">{item.description}</span>
                {categoryBadge(item.category)}
              </div>
              <div className="text-sm text-slate-600 sm:text-right">{item.qty}</div>
              <div className="font-mono text-sm text-slate-600 sm:text-right">{eur(item.unitPrice)}</div>
              <div className="font-mono text-sm font-semibold text-slate-900 sm:text-right">
                {eur(item.qty * item.unitPrice)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end border-b border-slate-100 px-6 py-6 sm:px-10">
        <div className="w-full max-w-[280px] space-y-1 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Sous-total</span>
            <span className="font-mono font-medium text-slate-800">{eur(subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>
              Frais de service
              <span className="mt-0.5 block text-[10px] font-normal text-slate-400">
                Plateforme & réservation
              </span>
            </span>
            <span className="font-mono font-medium text-slate-800">{eur(serviceFee)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>TVA (exonération culturelle)</span>
            <span className="font-mono font-medium text-slate-800">{eur(0)}</span>
          </div>
          <hr className="my-2 border-dashed border-slate-200" />
          <div className="flex items-center justify-between pt-1">
            <span className="text-base font-bold text-slate-900">TOTAL</span>
            <span className="font-mono text-xl font-bold text-festigo">{eur(total)}</span>
          </div>
          <p className="mt-3 text-[11px] leading-snug text-slate-500">
            Montant total enregistré sur la commande (frais éventuels inclus selon règles métier).
          </p>
        </div>
      </div>

      <div className="space-y-3 bg-slate-50/80 px-6 py-7 sm:px-10">
        <p className="text-base font-bold text-slate-800">Merci pour votre achat !</p>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
          <span>Besoin d&apos;aide ?</span>
          <a href="mailto:support@festigo.io" className="font-semibold text-festigo hover:underline">
            support@festigo.io
          </a>
        </div>
        <p className="border-t border-slate-200 pt-3 text-[11px] italic text-slate-400">
          Reçu généré électroniquement. Vos billets sont disponibles dans l&apos;onglet « Mes billets » de votre compte
          FestiGo.
        </p>
      </div>
    </div>
  );
}
