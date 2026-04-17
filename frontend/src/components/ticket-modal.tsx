import React from 'react';
import { X, Check, Calendar, MapPin, Clock } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { eventService, Event } from '../services/eventService';
import { typeBilletService, TypeBilletType, type TypeBillet } from '../services/typeBilletService';

const TYPE_ORDER: TypeBilletType[] = [TypeBilletType.GrandPublic, TypeBilletType.VIP, TypeBilletType.VVIP];

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
      return 'Accès général à la salle';
    case TypeBilletType.VIP:
      return 'Catégorie intermédiaire';
    case TypeBilletType.VVIP:
      return 'Expérience premium';
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
  features: string[];
  type: TypeBilletType;
}

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Événement concerné ; requis pour charger les tarifs depuis `type_billet`. */
  eventId: number | null;
}

export function TicketModal({ isOpen, onClose, eventId }: TicketModalProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTiers, setTicketTiers] = useState<TicketTierRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTierId, setSelectedTierId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

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
        features: [
          `${t.stock} place${t.stock > 1 ? 's' : ''} au tarif`,
          `Prix unitaire TTC : ${t.prix} €`,
          t.type === TypeBilletType.VVIP ? 'Catégorie la plus exclusive' : 'Réservation FestiGo',
        ],
      }));

      setTicketTiers(rows);
      const firstSelectable = rows.find((r) => r.available > 0);
      setSelectedTierId(firstSelectable ? String(firstSelectable.id) : rows.length ? String(rows[0].id) : '');
      setQuantity(1);
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
      setSelectedTierId('');
      setQuantity(1);
    }
  }, [isOpen]);

  const selectedTierData = useMemo(
    () => ticketTiers.find((tier) => String(tier.id) === selectedTierId),
    [ticketTiers, selectedTierId]
  );

  const maxPerOrder = useMemo(() => {
    if (!selectedTierData || selectedTierData.available <= 0) return 1;
    return Math.min(10, selectedTierData.available);
  }, [selectedTierData]);

  useEffect(() => {
    if (!isOpen || !selectedTierData || selectedTierData.available <= 0) return;
    const cap = Math.min(10, selectedTierData.available);
    setQuantity((q) => Math.min(Math.max(1, q), cap));
  }, [isOpen, selectedTierId, selectedTierData?.id, selectedTierData?.available]);

  if (!isOpen) return null;

  const totalPrice =
    selectedTierData && selectedTierData.available > 0 ? selectedTierData.price * quantity : 0;

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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-modal-title"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div className="relative flex max-h-[min(90dvh,100vh)] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lg">
        <div className="flex shrink-0 items-start justify-between border-b border-border p-6 md:p-8">
          <div className="min-w-0 flex-1 pr-4">
            <h2 id="ticket-modal-title" className="mb-2 truncate text-xl font-semibold text-foreground">
              {event?.nom || 'Événement'}
            </h2>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>{formatEventDate()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" />
                <span>{event?.heure ? String(event.heure).slice(0, 5) : 'Heure à confirmer'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="line-clamp-2">{event?.lieu || 'Lieu à confirmer'}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="p-6 md:p-8">
            <h3 className="mb-6 text-lg font-semibold text-foreground">Sélectionnez votre billet</h3>

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                <p className="text-sm">Chargement des tarifs…</p>
              </div>
            )}

            {!isLoading && loadError && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
                {loadError}
              </div>
            )}

            {!isLoading && !loadError && ticketTiers.length === 0 && (
              <div className="rounded-xl border border-border bg-muted/30 p-8 text-center text-muted-foreground">
                Aucun tarif n&apos;est disponible pour cet événement pour le moment.
              </div>
            )}

            {!isLoading && !loadError && ticketTiers.length > 0 && (
              <>
                <div className="mb-8 space-y-4">
                  {ticketTiers.map((tier) => {
                    const soldOut = tier.available <= 0;
                    const isSelected = String(tier.id) === selectedTierId;
                    return (
                      <div
                        key={tier.id}
                        role="button"
                        tabIndex={soldOut ? -1 : 0}
                        onClick={() => {
                          if (!soldOut) setSelectedTierId(String(tier.id));
                        }}
                        onKeyDown={(e) => {
                          if (!soldOut && e.key === 'Enter') setSelectedTierId(String(tier.id));
                        }}
                        className={`rounded-xl border p-6 transition-colors ${
                          soldOut
                            ? 'cursor-not-allowed border-border bg-muted/20 opacity-60'
                            : isSelected
                              ? 'cursor-pointer border-accent bg-accent/5 shadow-sm ring-2 ring-accent/20'
                              : 'cursor-pointer border-border hover:border-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                              soldOut
                                ? 'border-muted bg-muted'
                                : isSelected
                                  ? 'border-accent bg-accent'
                                  : 'border-border'
                            }`}
                          >
                            {isSelected && !soldOut && <Check className="h-3 w-3 text-white" />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex flex-wrap items-start justify-between gap-4">
                              <div>
                                <h4 className="mb-1 text-lg font-semibold text-foreground">{tier.name}</h4>
                                <p className="text-sm text-muted-foreground">{tier.description}</p>
                                {soldOut && (
                                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-destructive">
                                    Complet
                                  </p>
                                )}
                              </div>
                              <div className="flex-shrink-0 text-right">
                                <p className="text-xl font-semibold text-foreground">€{tier.price.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {soldOut ? '0 place' : `${tier.available} place${tier.available > 1 ? 's' : ''}`}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                              {tier.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Check className="h-3.5 w-3.5 flex-shrink-0 text-accent" />
                                  <span className="text-sm text-muted-foreground">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-border pt-6">
                  <label className="mb-3 block text-sm font-medium text-foreground">Nombre de billets</label>
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      disabled={!selectedTierData || selectedTierData.available <= 0}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card font-medium shadow-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      −
                    </button>
                    <span className="w-12 text-center text-xl font-medium text-foreground">{quantity}</span>
                    <button
                      type="button"
                      disabled={!selectedTierData || selectedTierData.available <= 0}
                      onClick={() => setQuantity((q) => Math.min(maxPerOrder, q + 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card font-medium shadow-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      +
                    </button>
                    <span className="text-sm text-muted-foreground">
                      Maximum {maxPerOrder} billet{maxPerOrder > 1 ? 's' : ''} (limite commande ou stock)
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-border bg-muted/30 p-4 md:p-6">
          <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="mb-1 text-sm text-muted-foreground">Montant total</p>
              <p className="text-2xl font-semibold text-foreground">€{totalPrice.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-border bg-card px-6 py-3 font-medium shadow-sm transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={
                  !selectedTierData ||
                  selectedTierData.available <= 0 ||
                  ticketTiers.length === 0 ||
                  isLoading
                }
                className="rounded-lg bg-accent px-8 py-3 font-medium text-accent-foreground shadow-sm transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
