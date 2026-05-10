import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Calendar, Download, FileText, Hash, Package, Printer, User } from 'lucide-react';
import { commandeService, StatutCommande, type Commande, type BilletCommandeLigne } from '../services/commandeService';
import { typeBilletService, TypeBilletType, type TypeBillet } from '../services/typeBilletService';
import { eventService, type Event } from '../services/eventService';
import { authService } from '../services/authService';
import { fetchApi } from '../services/api';
import {
  PurchaseReceiptCard,
  genreLabel,
  mapLibelleToReceiptCategory,
  type PurchaseReceiptItem,
} from './purchase-receipt';
import { parseEventStartMs } from '../services/userTicketsService';

const PENDING_LIGNES_KEY = (commandeId: number) => `commande_${commandeId}_lignes_pendues`;

function makeCodeBarre(commandeId: number, typeBilletId: number, index: number): string {
  const rnd = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `FG-${commandeId}-${typeBilletId}-${index}-${rnd}`;
}

interface LignePendue {
  typeBilletId: number;
  quantite: number;
}

export interface CommandeRecapProps {
  commandeId: number;
  /** Retour (ex. liste des événements ou compte) */
  onBack: () => void;
}

function labelTypeBillet(type: TypeBilletType): string {
  switch (type) {
    case TypeBilletType.GrandPublic:
      return 'Grand public';
    case TypeBilletType.VIP:
      return 'VIP';
    case TypeBilletType.VVIP:
      return 'VVIP';
    default:
      return type;
  }
}

function labelStatut(statut: StatutCommande): string {
  switch (statut) {
    case StatutCommande.EN_ATTENTE:
      return 'En attente';
    case StatutCommande.VALIDEE:
      return 'Validée';
    case StatutCommande.ANNULE:
      return 'Annulée';
    case StatutCommande.REMBOURSE:
      return 'Remboursée';
    default:
      return statut;
  }
}

function badgeStatutClass(statut: StatutCommande): string {
  switch (statut) {
    case StatutCommande.EN_ATTENTE:
      return 'bg-amber-500/15 text-amber-800 ring-1 ring-amber-500/25';
    case StatutCommande.VALIDEE:
      return 'bg-emerald-500/10 text-emerald-800 ring-1 ring-emerald-500/20';
    case StatutCommande.ANNULE:
      return 'bg-slate-200 text-slate-700 ring-1 ring-slate-300';
    case StatutCommande.REMBOURSE:
      return 'bg-violet-500/10 text-violet-800 ring-1 ring-violet-500/20';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

const eur = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

interface LigneRecap {
  typeBilletId: number;
  libelle: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
}

/**
 * Agrège les billets par type. Les clés utilisent l’id demandé à l’API (`tid`), pas seulement `t.id`
 * (souvent absent dans la réponse JSON), sinon le tableau reste vide.
 */
async function recapLinesFromBilletsApi(
  billets: BilletCommandeLigne[]
): Promise<{ lignes: LigneRecap[]; types: TypeBillet[] }> {
  const uniqueTypeIds = [
    ...new Set(billets.map((b) => b.typeBilletId).filter((id) => Number.isFinite(id) && id > 0)),
  ];
  const types: TypeBillet[] = [];
  const byTypeId = new Map<number, TypeBillet>();
  for (const tid of uniqueTypeIds) {
    try {
      const t = await typeBilletService.getTypeBilletById(tid);
      types.push(t);
      byTypeId.set(tid, t);
    } catch {
      /* type introuvable */
    }
  }
  const counts = new Map<number, number>();
  for (const b of billets) {
    if (!Number.isFinite(b.typeBilletId) || b.typeBilletId <= 0) continue;
    counts.set(b.typeBilletId, (counts.get(b.typeBilletId) ?? 0) + 1);
  }
  const lignes: LigneRecap[] = [];
  for (const [typeBilletId, qty] of counts) {
    const tb = byTypeId.get(typeBilletId);
    if (!tb) continue;
    const prix = typeof tb.prix === 'number' ? tb.prix : Number(tb.prix);
    const pu = Number.isFinite(prix) ? prix : 0;
    lignes.push({
      typeBilletId,
      libelle: labelTypeBillet(tb.type),
      quantite: qty,
      prixUnitaire: pu,
      sousTotal: pu * qty,
    });
  }
  return { lignes, types };
}

/** Billets API puis repli sessionStorage (même logique que le chargement initial). */
async function fetchRecapWithFallback(
  commandeId: number,
  statut: StatutCommande
): Promise<{ recap: LigneRecap[]; typesForEvent: TypeBillet[] }> {
  let billets: BilletCommandeLigne[] = [];
  try {
    billets = await commandeService.getBilletsByCommandeId(commandeId);
  } catch {
    billets = [];
  }

  let { lignes: recap, types: typesForEvent } = await recapLinesFromBilletsApi(billets);

  if (
    recap.length === 0 &&
    (statut === StatutCommande.EN_ATTENTE || statut === StatutCommande.VALIDEE)
  ) {
    try {
      const raw = sessionStorage.getItem(PENDING_LIGNES_KEY(commandeId));
      if (raw) {
        const pendues: LignePendue[] = JSON.parse(raw) as LignePendue[];
        const uniquePendingIds = [...new Set(pendues.map((p) => p.typeBilletId))];
        const typesPending: TypeBillet[] = [];
        const byPending = new Map<number, TypeBillet>();
        for (const tid of uniquePendingIds) {
          try {
            const t = await typeBilletService.getTypeBilletById(tid);
            typesPending.push(t);
            byPending.set(tid, t);
          } catch {
            /* ignore */
          }
        }
        const countsP = new Map<number, number>();
        for (const p of pendues) {
          countsP.set(p.typeBilletId, (countsP.get(p.typeBilletId) ?? 0) + p.quantite);
        }
        const recapPending: LigneRecap[] = [];
        for (const [typeBilletId, qty] of countsP) {
          const tb = byPending.get(typeBilletId);
          if (!tb) continue;
          const prix = typeof tb.prix === 'number' ? tb.prix : Number(tb.prix);
          const pu = Number.isFinite(prix) ? prix : 0;
          recapPending.push({
            typeBilletId,
            libelle: labelTypeBillet(tb.type),
            quantite: qty,
            prixUnitaire: pu,
            sousTotal: pu * qty,
          });
        }
        if (recapPending.length > 0) {
          recap = recapPending;
          typesForEvent = typesPending;
        }
      }
    } catch {
      /* sessionStorage / JSON */
    }
  }

  return { recap, typesForEvent };
}

export function CommandeRecap({ commandeId, onBack }: CommandeRecapProps) {
  const [commande, setCommande] = useState<Commande | null>(null);
  const [eventInfo, setEventInfo] = useState<Event | null>(null);
  const [lignes, setLignes] = useState<LigneRecap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validateError, setValidateError] = useState<string | null>(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const acheteur = authService.getCurrentUser();

  const receiptItems = useMemo((): PurchaseReceiptItem[] => {
    return lignes.map((l) => ({
      description: l.libelle,
      category: mapLibelleToReceiptCategory(l.libelle),
      qty: l.quantite,
      unitPrice: l.prixUnitaire,
    }));
  }, [lignes]);

  const subtotalFromLines = useMemo(
    () => lignes.reduce((acc, l) => acc + l.sousTotal, 0),
    [lignes]
  );

  const serviceFeeAmount = useMemo(() => {
    if (!commande) return 0;
    const diff = commande.montantTotal - subtotalFromLines;
    return diff > 0.01 ? diff : 0;
  }, [commande, subtotalFromLines]);

  const receiptCommonProps = useMemo(() => {
    if (!commande) return null;
    let purchaseDate = '';
    let purchaseTime = '';
    try {
      const d = new Date(commande.date);
      purchaseDate = d.toLocaleDateString('fr-FR', { dateStyle: 'long' });
      purchaseTime = d.toLocaleTimeString('fr-FR', { timeStyle: 'short' });
    } catch {
      purchaseDate = commande.date;
    }
    const orderId = `FGO-2026-${String(commande.id).padStart(6, '0')}`;
    let eventDate = '—';
    let eventTime = '—';
    let eventTitle = 'Événement';
    let venue = '—';
    let eventSubtitle: string | undefined;
    if (eventInfo) {
      eventTitle = eventInfo.nom;
      venue = eventInfo.lieu;
      const gl = genreLabel(eventInfo.genreMusical);
      if (gl) eventSubtitle = `Genre : ${gl}`;
      const ms = parseEventStartMs(eventInfo);
      const dt = new Date(ms);
      if (!Number.isNaN(dt.getTime())) {
        eventDate = dt.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        eventTime = `À partir de ${dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
      }
    }
    return {
      orderId,
      internalReference: `#${commande.id}`,
      purchaseDate,
      purchaseTime,
      paymentMethod: 'Paiement sécurisé en ligne',
      buyerName: acheteur?.nom,
      buyerEmail: acheteur?.email,
      eventTitle,
      eventSubtitle,
      venue,
      eventDate,
      eventTime,
      items: receiptItems,
      subtotal: subtotalFromLines,
      serviceFee: serviceFeeAmount,
      total: commande.montantTotal,
    };
  }, [
    commande,
    eventInfo,
    receiptItems,
    subtotalFromLines,
    serviceFeeAmount,
    acheteur?.nom,
    acheteur?.email,
  ]);

  useEffect(() => {
    if (!receiptDialogOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setReceiptDialogOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [receiptDialogOpen]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const c = await commandeService.getCommandeById(commandeId);
        if (cancelled) return;
        setCommande(c);

        const { recap, typesForEvent } = await fetchRecapWithFallback(commandeId, c.statut);
        if (cancelled) return;

        setLignes(recap);

        const firstEventId = typesForEvent.find((t) => t.eventId != null)?.eventId;
        if (firstEventId != null) {
          try {
            const ev = await eventService.getEventById(firstEventId);
            if (!cancelled) setEventInfo(ev);
          } catch {
            if (!cancelled) setEventInfo(null);
          }
        } else {
          setEventInfo(null);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Impossible de charger cette commande.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [commandeId]);

  /** Commande validée : si les lignes sont encore vides (timing API / premier rendu), on recharge une fois pour le reçu. */
  useEffect(() => {
    if (isLoading || !commande || commande.statut !== StatutCommande.VALIDEE) return;
    if (lignes.length > 0) return;

    let cancelled = false;
    void (async () => {
      const { recap, typesForEvent } = await fetchRecapWithFallback(commandeId, StatutCommande.VALIDEE);
      if (cancelled || recap.length === 0) return;
      setLignes(recap);
      const firstEventId = typesForEvent.find((t) => t.eventId != null)?.eventId;
      if (firstEventId != null) {
        try {
          const ev = await eventService.getEventById(firstEventId);
          if (!cancelled) setEventInfo(ev);
        } catch {
          if (!cancelled) setEventInfo(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoading, commande?.statut, commande?.id, commandeId, lignes.length]);

  const formatDate = (raw: string) => {
    try {
      return new Date(raw).toLocaleString('fr-FR', {
        dateStyle: 'long',
        timeStyle: 'short',
      });
    } catch {
      return raw;
    }
  };

  const handleValider = async () => {
    if (!commande || commande.statut !== StatutCommande.EN_ATTENTE) return;
    setValidateError(null);
    setIsValidating(true);
    try {
      let billetsExisting = await commandeService.getBilletsByCommandeId(commandeId);
      if (billetsExisting.length === 0) {
        const raw = sessionStorage.getItem(PENDING_LIGNES_KEY(commandeId));
        if (!raw) {
          setValidateError(
            'Données de réservation introuvables. Effectuez une nouvelle réservation depuis la billetterie.'
          );
          return;
        }
        const pendues: LignePendue[] = JSON.parse(raw) as LignePendue[];
        let ticketIndex = 0;
        for (const pl of pendues) {
          for (let i = 0; i < pl.quantite; i++) {
            await fetchApi<{ id: number }>('/billets', {
              method: 'POST',
              body: JSON.stringify({
                codeBarre: makeCodeBarre(commandeId, pl.typeBilletId, ticketIndex++),
                commandeId,
                typeBilletId: pl.typeBilletId,
              }),
            });
          }
        }
      }
      const updated = await commandeService.updateCommande(commandeId, { statut: StatutCommande.VALIDEE });
      setCommande(updated);
      const { recap, typesForEvent } = await fetchRecapWithFallback(commandeId, StatutCommande.VALIDEE);
      setLignes(recap);
      try {
        if (recap.length > 0) {
          sessionStorage.removeItem(PENDING_LIGNES_KEY(commandeId));
        }
      } catch {
        /* */
      }
      const firstEventId = typesForEvent.find((t) => t.eventId != null)?.eventId;
      if (firstEventId != null) {
        try {
          const ev = await eventService.getEventById(firstEventId);
          setEventInfo(ev);
        } catch {
          setEventInfo(null);
        }
      }
    } catch (e) {
      console.error(e);
      setValidateError(
        e instanceof Error ? e.message : 'La validation a échoué. Réessayez dans un instant.'
      );
    } finally {
      setIsValidating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-festigo border-t-transparent" />
          <p className="text-sm font-medium text-slate-600">Chargement du récapitulatif…</p>
        </div>
      </div>
    );
  }

  if (error || !commande) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
        <p className="text-center text-slate-600">{error || 'Commande introuvable.'}</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-6 rounded-xl bg-festigo px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-festigo-hover"
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16 font-sans antialiased">
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-festigo focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
          <div className="min-w-0 flex-1 text-right">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Récapitulatif</p>
            <p className="truncate text-sm font-semibold text-slate-900">Commande #{commande.id}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Votre commande</h1>
            {eventInfo && (
              <p className="mt-2 text-lg font-semibold text-festigo">{eventInfo.nom}</p>
            )}
          </div>
          <span
            className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-all duration-200 ${badgeStatutClass(commande.statut)}`}
          >
            {labelStatut(commande.statut)}
          </span>
        </div>

        {commande.statut === StatutCommande.EN_ATTENTE && (
          <div className="mt-6 rounded-2xl border border-amber-200/80 bg-amber-50/90 p-5 shadow-sm">
            <p className="text-sm leading-relaxed text-amber-950/90">
              Votre commande est en attente. Validez-la pour confirmer l&apos;achat et générer vos billets.
            </p>
            {validateError && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-800">{validateError}</p>
            )}
            <button
              type="button"
              onClick={() => void handleValider()}
              disabled={isValidating}
              className="focus-ring mt-4 w-full rounded-xl bg-festigo py-3 text-sm font-bold uppercase tracking-[0.06em] text-white shadow-md shadow-festigo/20 transition-colors hover:bg-festigo-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isValidating ? 'Validation…' : 'Valider la commande'}
            </button>
          </div>
        )}

        {commande.statut === StatutCommande.VALIDEE && receiptCommonProps && (
          <>
            <div className="mt-6 rounded-2xl border border-emerald-200/90 bg-emerald-50/90 p-5 shadow-sm">
              <p className="text-sm font-medium leading-relaxed text-emerald-950">
                Votre achat est confirmé. Vous pouvez consulter ou enregistrer votre reçu (PDF via la boîte de dialogue
                d&apos;impression du navigateur).
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setReceiptDialogOpen(true)}
                  className="focus-ring inline-flex items-center gap-2 rounded-xl border border-festigo/30 bg-white px-5 py-2.5 text-sm font-semibold text-festigo shadow-sm transition-colors hover:bg-festigo/5"
                >
                  <FileText className="h-4 w-4" aria-hidden />
                  Voir le reçu
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="focus-ring inline-flex items-center gap-2 rounded-xl bg-festigo px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-festigo/20 transition-colors hover:bg-festigo-hover"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  Télécharger le reçu
                </button>
              </div>
            </div>
            <div
              className="purchase-receipt-print-root pointer-events-none fixed top-0 -left-[20000px] w-[760px]"
              aria-hidden
            >
              <PurchaseReceiptCard {...receiptCommonProps} />
            </div>
            {receiptDialogOpen ? (
              <div
                className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center"
                role="dialog"
                aria-modal="true"
                aria-labelledby="purchase-receipt-dialog-title"
              >
                <button
                  type="button"
                  className="absolute inset-0 cursor-default"
                  aria-label="Fermer l’aperçu du reçu"
                  onClick={() => setReceiptDialogOpen(false)}
                />
                <div
                  className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-xl sm:p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 id="purchase-receipt-dialog-title" className="text-lg font-bold text-slate-900">
                    Reçu — {receiptCommonProps.orderId}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Aperçu de votre commande. « Télécharger le reçu » ouvre l&apos;impression : choisissez « Enregistrer au
                    format PDF » si votre navigateur le propose.
                  </p>
                  <div className="mt-4 rounded-xl border border-slate-200/80 bg-white p-1 shadow-sm">
                    <PurchaseReceiptCard {...receiptCommonProps} />
                  </div>
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setReceiptDialogOpen(false)}
                      className="focus-ring rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Fermer
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="focus-ring inline-flex items-center gap-2 rounded-xl bg-festigo px-4 py-2 text-sm font-semibold text-white hover:bg-festigo-hover"
                    >
                      <Printer className="h-4 w-4" aria-hidden />
                      Enregistrer en PDF
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}

        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Informations</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-festigo/10">
                <Hash className="h-5 w-5 text-festigo" />
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">Référence</dt>
                <dd className="mt-0.5 font-mono text-sm font-semibold text-slate-900">#{commande.id}</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-festigo/10">
                <Calendar className="h-5 w-5 text-festigo" />
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">Date</dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-900">{formatDate(commande.date)}</dd>
              </div>
            </div>
            {acheteur && (
              <div className="flex gap-3 sm:col-span-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-festigo/10">
                  <User className="h-5 w-5 text-festigo" />
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">Acheteur</dt>
                  <dd className="mt-0.5 text-sm font-medium text-slate-900">{acheteur.nom}</dd>
                  <dd className="text-xs text-slate-500">{acheteur.email}</dd>
                </div>
              </div>
            )}
          </dl>
        </div>

        {commande.statut !== StatutCommande.VALIDEE && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-festigo" />
              <h2 className="text-lg font-semibold text-slate-900">Détail des billets</h2>
            </div>

            {lignes.length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                Aucun billet n&apos;est encore associé à cette commande.
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-slate-50/80">
                      <th className="px-4 py-3 font-semibold text-slate-700">Catégorie</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Qté</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Prix unit.</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Sous-total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lignes.map((l) => (
                      <tr key={l.typeBilletId} className="border-b border-gray-50 transition-colors duration-200 last:border-0 hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-900">{l.libelle}</td>
                        <td className="px-4 py-3 text-center tabular-nums text-slate-700">{l.quantite}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-slate-600">{eur(l.prixUnitaire)}</td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-900">{eur(l.sousTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="text-base font-bold text-slate-900">Montant total</span>
              <span className="text-xl font-bold tabular-nums text-emerald-700">{eur(commande.montantTotal)}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Le montant enregistré sur la commande est celui retourné par le serveur (frais éventuels inclus selon règles métier).
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
