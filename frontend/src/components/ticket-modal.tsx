import React from 'react';
import { X, Calendar, MapPin, Clock, Info } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { eventService, Event } from '../services/eventService';
import { typeBilletService, TypeBilletType, type TypeBillet } from '../services/typeBilletService';
import { commandeService, StatutCommande } from '../services/commandeService';
import { authService } from '../services/authService';

const TYPE_ORDER: TypeBilletType[] = [TypeBilletType.GrandPublic, TypeBilletType.VIP, TypeBilletType.VVIP];

const eur = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

function typeBilletDisplayName(type: TypeBilletType): string {
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

function typeBilletShortDescription(type: TypeBilletType): string {
  switch (type) {
    case TypeBilletType.GrandPublic:
      return 'Billet valable pour l’accès général à la salle.';
    case TypeBilletType.VIP:
      return 'Catégorie intermédiaire — meilleur confort.';
    case TypeBilletType.VVIP:
      return 'Expérience premium — accès et avantages renforcés.';
    default:
      return '';
  }
}

interface TicketTierRow {
  id: number;
  name: string;
  price: number;
  available: number;
  description: string;
  type: TypeBilletType;
}

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: number | null;
  /** Après création de la commande seule (EN_ATTENTE, billets à la validation). */
  onReservationSuccess?: (commandeId: number) => void;
}

function maxQtyForTier(available: number): number {
  if (available <= 0) return 0;
  return Math.min(10, available);
}

export function TicketModal({ isOpen, onClose, eventId, onReservationSuccess }: TicketModalProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTiers, setTicketTiers] = useState<TicketTierRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [isReserving, setIsReserving] = useState(false);
  const [reserveError, setReserveError] = useState<string | null>(null);
  /** Commande EN_ATTENTE existante : demander accès ou remplacer. */
  const [pendingOrderModalId, setPendingOrderModalId] = useState<number | null>(null);

  const loadModalData = useCallback(async () => {
    if (!eventId) {
      setLoadError('Aucun événement sélectionné.');
      setEvent(null);
      setTicketTiers([]);
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    try {
      const [eventData, types] = await Promise.all([
        eventService.getEventById(eventId),
        typeBilletService.getTypeBilletsByEventId(eventId),
      ]);

      setEvent(eventData);

      const withId = types.filter((t): t is TypeBillet & { id: number } => typeof t.id === 'number' && t.id >= 0);
      withId.sort((a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type));

      const rows: TicketTierRow[] = withId.map((t) => ({
        id: t.id,
        name: typeBilletDisplayName(t.type),
        price: t.prix,
        available: t.stock,
        description: typeBilletShortDescription(t.type),
        type: t.type,
      }));

      setTicketTiers(rows);
      setQuantities({});
    } catch (e) {
      console.error(e);
      setLoadError('Impossible de charger les billets pour cet événement.');
      setEvent(null);
      setTicketTiers([]);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (!isOpen) return;
    void loadModalData();
  }, [isOpen, loadModalData]);

  useEffect(() => {
    if (!isOpen) {
      setEvent(null);
      setTicketTiers([]);
      setLoadError(null);
      setQuantities({});
      setReserveError(null);
      setIsReserving(false);
      setPendingOrderModalId(null);
    }
  }, [isOpen]);

  const setTierQuantity = useCallback((tier: TicketTierRow, next: number) => {
    const cap = maxQtyForTier(tier.available);
    const clamped = Math.max(0, Math.min(cap, next));
    setQuantities((prev) => {
      const copy = { ...prev };
      if (clamped === 0) delete copy[tier.id];
      else copy[tier.id] = clamped;
      return copy;
    });
  }, []);

  const summaryLines = useMemo(() => {
    return ticketTiers
      .filter((t) => (quantities[t.id] ?? 0) > 0)
      .map((t) => ({
        tier: t,
        qty: quantities[t.id] ?? 0,
        lineTotal: t.price * (quantities[t.id] ?? 0),
      }));
  }, [ticketTiers, quantities]);

  const totalArticles = useMemo(
    () => summaryLines.reduce((s, l) => s + l.qty, 0),
    [summaryLines]
  );

  const total = useMemo(
    () => summaryLines.reduce((s, l) => s + l.lineTotal, 0),
    [summaryLines]
  );

  const PENDING_LIGNES_KEY = (id: number) => `commande_${id}_lignes_pendues`;

  const createPendingCommandeOnly = useCallback(
    async (acheteurId: number): Promise<number> => {
      const commande = await commandeService.createCommande({
        montantTotal: total,
        acheteurId,
        statut: StatutCommande.EN_ATTENTE,
      });
      const commandeId = commande.id;
      const lignes = summaryLines.map((line) => ({
        typeBilletId: line.tier.id,
        quantite: line.qty,
      }));
      try {
        sessionStorage.setItem(PENDING_LIGNES_KEY(commandeId), JSON.stringify(lignes));
      } catch {
        /* ignore quota / private mode */
      }
      return commandeId;
    },
    [total, summaryLines]
  );

  const handleGoToExistingPendingOrder = useCallback(() => {
    if (pendingOrderModalId == null) return;
    const id = pendingOrderModalId;
    setPendingOrderModalId(null);
    onClose();
    onReservationSuccess?.(id);
  }, [pendingOrderModalId, onClose, onReservationSuccess]);

  const handleReplacePendingAndReserve = useCallback(async () => {
    if (pendingOrderModalId == null) return;
    const user = authService.getCurrentUser();
    if (!user?.id) {
      setReserveError('Connectez-vous pour réserver des billets.');
      return;
    }
    const toDelete = pendingOrderModalId;
    setPendingOrderModalId(null);
    setReserveError(null);
    setIsReserving(true);
    try {
      await commandeService.deleteCommande(toDelete);
      try {
        sessionStorage.removeItem(PENDING_LIGNES_KEY(toDelete));
      } catch {
        /* */
      }
      const commandeId = await createPendingCommandeOnly(user.id);
      onClose();
      onReservationSuccess?.(commandeId);
    } catch (e) {
      console.error(e);
      setReserveError(
        e instanceof Error ? e.message : 'La réservation a échoué. Réessayez dans un instant.'
      );
    } finally {
      setIsReserving(false);
    }
  }, [pendingOrderModalId, createPendingCommandeOnly, onClose, onReservationSuccess]);

  const handleReserve = useCallback(async () => {
    if (totalArticles === 0 || isLoading) return;
    const user = authService.getCurrentUser();
    if (!user?.id) {
      setReserveError('Connectez-vous pour réserver des billets.');
      return;
    }
    setReserveError(null);
    try {
      const existing = await commandeService.getCommandeEnAttenteForUser(user.id);
      if (existing) {
        setPendingOrderModalId(existing.id);
        return;
      }
    } catch (e) {
      console.error(e);
      setReserveError(
        e instanceof Error ? e.message : 'Impossible de vérifier vos commandes en cours.'
      );
      return;
    }
    setIsReserving(true);
    try {
      const commandeId = await createPendingCommandeOnly(user.id);
      onClose();
      onReservationSuccess?.(commandeId);
    } catch (e) {
      console.error(e);
      setReserveError(
        e instanceof Error ? e.message : 'La réservation a échoué. Réessayez dans un instant.'
      );
    } finally {
      setIsReserving(false);
    }
  }, [totalArticles, isLoading, createPendingCommandeOnly, onClose, onReservationSuccess]);

  if (!isOpen) return null;

  const formatEventDate = () => {
    if (!event?.date) return 'Date à confirmer';
    try {
      return new Date(event.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return event.date;
    }
  };

  return (
    <>
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 font-sans antialiased sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-modal-title"
    >
      <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]" onClick={onClose} aria-hidden />

      <div className="relative flex max-h-[min(90dvh,100vh)] w-full max-w-[52rem] flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-2xl shadow-slate-900/10">
        <header className="flex shrink-0 items-start gap-4 border-b border-gray-100 bg-white px-5 py-5 sm:px-7 sm:py-6">
          <div className="min-w-0 flex-1 border-l-4 border-festigo pl-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Billetterie</p>
            <h2 id="ticket-modal-title" className="mt-1.5 text-xl font-semibold leading-snug tracking-tight text-slate-900 sm:text-2xl">
              {event?.nom || 'Événement'}
            </h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-600">
              <li className="flex items-start gap-2.5">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-festigo" aria-hidden />
                <span>{formatEventDate()}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-festigo" aria-hidden />
                <span>{event?.heure ? String(event.heure).slice(0, 5) : 'Heure à confirmer'}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-festigo" aria-hidden />
                <span className="line-clamp-3">{event?.lieu || 'Lieu à confirmer'}</span>
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </header>

        <div className="flex min-h-0 min-h-[16rem] flex-1 flex-col bg-slate-50/50 lg:flex-row">
          <section className="min-h-0 flex-1 overflow-y-auto border-t border-gray-100 px-5 py-6 sm:px-7 lg:border-t-0 lg:border-r lg:border-gray-200 lg:py-7">
            <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Sélectionnez votre billet
            </h3>

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <div
                  className="mb-4 h-11 w-11 animate-spin rounded-full border-2 border-festigo/30 border-t-festigo"
                  aria-hidden
                />
                <p className="text-sm font-medium">Chargement des tarifs…</p>
              </div>
            )}

            {!isLoading && loadError && (
              <div className="rounded-2xl border border-red-100 bg-red-50/90 px-4 py-4 text-center text-sm leading-relaxed text-red-800">
                {loadError}
              </div>
            )}

            {!isLoading && !loadError && ticketTiers.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white/80 px-6 py-12 text-center">
                <p className="text-sm leading-relaxed text-slate-500">Aucun tarif disponible pour cet événement.</p>
              </div>
            )}

            {!isLoading && !loadError && ticketTiers.length > 0 && (
              <ul className="space-y-5">
                {ticketTiers.map((tier) => {
                  const soldOut = tier.available <= 0;
                  const cap = maxQtyForTier(tier.available);
                  const q = quantities[tier.id] ?? 0;
                  return (
                    <li key={tier.id}>
                      <div
                        className={`overflow-hidden rounded-2xl border border-gray-100 bg-white card-shadow ${
                          soldOut ? 'opacity-[0.72]' : ''
                        }`}
                      >
                        <div className="p-5 sm:p-6">
                          <p className="text-base font-semibold text-slate-900">{tier.name}</p>
                          <p className="mt-2 text-sm leading-relaxed text-slate-600">{tier.description}</p>
                          <div className="mt-5 flex flex-col gap-4 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xl font-bold tabular-nums tracking-tight text-slate-900">{eur(tier.price)}</p>
                            <div className="flex items-center justify-end gap-3 sm:justify-start">
                              <button
                                type="button"
                                disabled={soldOut || q <= 0}
                                onClick={() => setTierQuantity(tier, q - 1)}
                                className="focus-ring flex h-10 w-10 items-center justify-center rounded-full bg-festigo text-lg font-medium leading-none text-white transition-colors hover:bg-festigo-hover disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                                aria-label="Diminuer"
                              >
                                −
                              </button>
                              <span className="min-w-[2rem] text-center text-lg font-semibold tabular-nums text-slate-900">
                                {q}
                              </span>
                              <button
                                type="button"
                                disabled={soldOut || q >= cap}
                                onClick={() => setTierQuantity(tier, q + 1)}
                                className="focus-ring flex h-10 w-10 items-center justify-center rounded-full bg-festigo text-lg font-medium leading-none text-white transition-colors hover:bg-festigo-hover disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                                aria-label="Augmenter"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          {!soldOut && cap < 10 && (
                            <p className="mt-3 text-xs text-slate-500">Stock : {tier.available} place(s) maximum.</p>
                          )}
                          {soldOut && (
                            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-red-600">Complet</p>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <aside className="flex w-full shrink-0 flex-col border-t border-gray-200 bg-white lg:w-[min(100%,21rem)] lg:border-t-0 lg:border-l lg:border-gray-200 xl:w-[min(100%,23rem)]">
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-6 sm:py-7">
              <div className="mb-6 border-b border-gray-100 pb-5">
                <p className="text-4xl font-bold tabular-nums leading-none tracking-tight text-slate-900">×{totalArticles}</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">Articles sélectionnés</p>
              </div>

              {summaryLines.length === 0 ? (
                <p className="rounded-xl bg-slate-50/80 px-3 py-4 text-center text-sm leading-relaxed text-slate-500">
                  Sélectionnez des quantités à gauche pour afficher le récapitulatif.
                </p>
              ) : (
                <ul className="space-y-3">
                  {summaryLines.map(({ tier, qty, lineTotal }) => (
                    <li
                      key={tier.id}
                      className="rounded-xl border border-gray-100 bg-slate-50/90 px-4 py-3.5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 flex-1 text-sm font-semibold leading-snug text-slate-900">{tier.name}</p>
                        <span className="shrink-0 text-sm font-bold tabular-nums text-slate-900">{eur(lineTotal)}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        
                        <span className="text-xs tabular-nums text-slate-500">
                          {eur(tier.price)} × {qty}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-8 space-y-0 rounded-xl border border-gray-100 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between border-b border-gray-100/80 py-2.5 text-sm first:pt-0">
                  <span className="text-slate-600">Sous-total</span>
                  <span className="tabular-nums font-medium text-slate-900">{eur(total)}</span>
                </div>
                
                <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                  <span className="text-base font-bold text-slate-900">Total</span>
                  <span className="text-lg font-bold tabular-nums text-festigo">{eur(total)}</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 space-y-2 border-t border-gray-100 bg-white px-5 py-4 sm:px-6">
              {reserveError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-medium leading-snug text-red-800">
                  {reserveError}
                </p>
              )}
              <button
                type="button"
                onClick={() => void handleReserve()}
                disabled={totalArticles === 0 || isLoading || isReserving}
                className="focus-ring w-full rounded-xl bg-festigo py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-white shadow-md shadow-festigo/20 transition-all hover:bg-festigo-hover hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isReserving ? 'Réservation…' : 'Réserver'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-center text-sm font-medium text-slate-500 transition-colors hover:text-festigo"
              >
                Annuler
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>

    {pendingOrderModalId != null && (
      <div
        className="fixed inset-0 z-[110] flex items-center justify-center p-3 font-sans antialiased sm:p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pending-order-dialog-title"
      >
        <div
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
          onClick={() => setPendingOrderModalId(null)}
          aria-hidden
        />
        <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-2xl shadow-slate-900/15">
          <div className="p-6 sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <h3
                id="pending-order-dialog-title"
                className="min-w-0 flex-1 text-lg font-semibold leading-snug tracking-tight text-slate-900"
              >
                Commande en cours
              </h3>
              <button
                type="button"
                onClick={() => setPendingOrderModalId(null)}
                className="focus-ring -mr-1 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-slate-600">
              Vous avez déjà une commande en cours. Voulez-vous y accéder&nbsp;?
            </p>
            <div className="mt-6 flex flex-row flex-wrap items-center justify-center gap-2.5 sm:flex-nowrap sm:gap-3">
              <button
                type="button"
                onClick={() => void handleReplacePendingAndReserve()}
                disabled={isReserving}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-sm font-semibold leading-snug text-slate-800 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[2.75rem] sm:shrink-0 sm:whitespace-nowrap sm:px-4"
              >
                {isReserving ? 'Traitement…' : 'Non, nouvelle commande'}
              </button>
              <button
                type="button"
                onClick={handleGoToExistingPendingOrder}
                disabled={isReserving}
                className="rounded-xl bg-festigo px-5 py-3 text-sm font-bold uppercase tracking-[0.06em] text-white shadow-md shadow-festigo/20 transition-colors hover:bg-festigo-hover disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[2.75rem] sm:min-w-[12rem] sm:shrink-0 sm:whitespace-nowrap"
              >
                Oui, y accéder
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
