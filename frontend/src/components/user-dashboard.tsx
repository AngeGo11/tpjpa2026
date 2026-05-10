import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Ticket, Bookmark, Download, QrCode, Calendar, MapPin, Clock, Loader2, X } from 'lucide-react';
import { authService } from '../services/authService';
import { getUserDisplayName, getUserFirstName, getUserInitials } from '../services/userService';
import { fetchUserTickets, type UserTicketView } from '../services/userTicketsService';
import type { Event } from '../services/eventService';
import * as favoriteService from '../services/favoriteService';
import { FestigoDigitalPass, FestigoEntryQrThumb } from './festigo-digital-pass';
import { FestigoLogo } from './festigo-logo';

export type UserDashboardView = 'tickets' | 'favorites' | 'profile' | 'settings' | 'help';
export type FanAppSection = 'discovery' | UserDashboardView;
type TicketStatus = 'upcoming' | 'past';

/** @deprecated Le badge « Favoris » est alimenté dynamiquement depuis `App`. */
export function getUserAccountMenuBadgeCounts() {
  return {
    favorites: 0,
  };
}

export function userDashboardSectionTitle(view: UserDashboardView): string {
  switch (view) {
    case 'tickets':
      return 'Mes billets';
    case 'favorites':
      return 'Favoris';
    case 'profile':
      return 'Profil';
    case 'settings':
      return 'Sécurité & confidentialité';
    case 'help':
      return 'Aide & support';
    default:
      return 'Mon compte';
  }
}

export function fanAppSectionTitle(section: FanAppSection): string {
  if (section === 'discovery') return 'Découverte';
  return userDashboardSectionTitle(section);
}

export interface UserDashboardProps {
  onDiscoverEvents?: () => void;
  onLogin?: () => void;
  activeView: UserDashboardView;
  onFavoritesChanged?: () => void;
  onOpenEvent?: (eventId: number) => void;
}

export function UserDashboard({
  onDiscoverEvents,
  onLogin,
  activeView,
  onFavoritesChanged,
  onOpenEvent,
}: UserDashboardProps) {
  const currentUser = authService.getCurrentUser();
  const firstName = currentUser ? getUserFirstName(currentUser) : null;
  const [ticketFilter, setTicketFilter] = useState<TicketStatus>('upcoming');
  const [userTickets, setUserTickets] = useState<UserTicketView[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [detailTicket, setDetailTicket] = useState<UserTicketView | null>(null);
  const [printTicket, setPrintTicket] = useState<UserTicketView | null>(null);

  const loadTickets = useCallback(async () => {
    if (!currentUser?.id) {
      setUserTickets([]);
      return;
    }
    setTicketsLoading(true);
    setTicketsError(null);
    try {
      const list = await fetchUserTickets(currentUser.id);
      setUserTickets(list);
    } catch (e) {
      setTicketsError(e instanceof Error ? e.message : 'Impossible de charger tes billets.');
      setUserTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (activeView !== 'tickets') return;
    void loadTickets();
  }, [activeView, loadTickets]);

  useEffect(() => {
    if (activeView !== 'favorites' || !currentUser?.id) {
      setFavoriteEvents([]);
      setFavoritesError(null);
      return;
    }
    let cancelled = false;
    setFavoritesLoading(true);
    setFavoritesError(null);
    favoriteService
      .getFavoriteEvents(currentUser.id)
      .then((list) => {
        if (!cancelled) setFavoriteEvents(list);
      })
      .catch(() => {
        if (!cancelled) {
          setFavoriteEvents([]);
          setFavoritesError('Impossible de charger tes favoris.');
        }
      })
      .finally(() => {
        if (!cancelled) setFavoritesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeView, currentUser?.id]);

  useEffect(() => {
    if (!printTicket) return;
    const id = requestAnimationFrame(() => window.print());
    return () => cancelAnimationFrame(id);
  }, [printTicket]);

  useEffect(() => {
    const onAfterPrint = () => setPrintTicket(null);
    window.addEventListener('afterprint', onAfterPrint);
    return () => window.removeEventListener('afterprint', onAfterPrint);
  }, []);

  const filteredTickets = useMemo(() => {
    const f = userTickets.filter((ticket) => ticket.status === ticketFilter);
    if (ticketFilter === 'upcoming') {
      return [...f].sort((a, b) => a.eventMs - b.eventMs);
    }
    return [...f].sort((a, b) => b.eventMs - a.eventMs);
  }, [userTickets, ticketFilter]);

  const upcomingCount = useMemo(() => userTickets.filter((t) => t.status === 'upcoming').length, [userTickets]);

  const getTicketTypeStyles = (type: string) => {
    if (type === 'VVIP') return 'bg-festigo/10 text-festigo border border-festigo/25';
    if (type === 'VIP') return 'bg-festigo/10 text-festigo border border-festigo/20';
    return 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  const handleDownloadPdf = (ticket: UserTicketView) => {
    setPrintTicket(ticket);
  };

  const handleViewTicket = (ticket: UserTicketView) => {
    setDetailTicket(ticket);
  };

  const handleTransfer = (ticketId: number) => {
    console.log('Transferring ticket:', ticketId);
  };

  const handleRemoveFavorite = async (eventId: number) => {
    if (!currentUser?.id) return;
    try {
      await favoriteService.removeFavorite(currentUser.id, eventId);
      setFavoriteEvents((prev) => prev.filter((e) => e.id !== eventId));
      onFavoritesChanged?.();
    } catch (err) {
      console.error(err);
      window.alert('Impossible de retirer ce favori.');
    }
  };

  const handleBuyNow = (eventId: number) => {
    onOpenEvent?.(eventId);
  };

  const getFavoriteCardImageUrl = (imagePath: string | undefined | null) => {
    const value = (imagePath || '').trim();
    if (!value) return '/images/login-branding.jpg';
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) return value;
    if (value.startsWith('/images/')) return value;
    const fileName = value.split('/').pop()?.split('?')[0];
    if (fileName) return `/images/${encodeURIComponent(fileName)}`;
    return value.startsWith('/') ? value : '/images/login-branding.jpg';
  };

  const ticketHolderName = currentUser ? getUserDisplayName(currentUser) : '';

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gray-50">
      {printTicket &&
        createPortal(
          <div className="festigo-ticket-print-root flex justify-center bg-white p-8">
            <FestigoDigitalPass ticket={printTicket} holderName={ticketHolderName || '—'} />
          </div>,
          document.body
        )}

      {detailTicket && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="festigo-ticket-dialog-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]"
            aria-label="Fermer"
            onClick={() => setDetailTicket(null)}
          />
          <div className="relative z-[1] max-h-[min(92dvh,100vh)] w-full max-w-[460px] overflow-y-auto rounded-2xl shadow-2xl">
            <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-5 ring-1 ring-white/10 sm:p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p id="festigo-ticket-dialog-title" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                    Passe numérique
                  </p>
                  <FestigoLogo
                    variant="onDark"
                    className="mt-1 h-8 max-w-[52px]"
                    wordmarkClassName="text-sm font-bold"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setDetailTicket(null)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  aria-label="Fermer le billet"
                >
                  <X className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>
              <FestigoDigitalPass ticket={detailTicket} holderName={ticketHolderName || '—'} />
            </div>
          </div>
        </div>
      )}

      <main className={`min-h-0 flex-1 overflow-auto ${activeView === 'tickets' ? 'bg-gray-50' : 'bg-gray-50/90'}`}>
        {activeView === 'tickets' && (
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
            <div className="mb-8">
              <h2 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">
                Bonjour{firstName ? `, ${firstName}` : ''}
              </h2>
              <p className="text-gray-500">Tes billets, au format portefeuille numérique.</p>
            </div>

            {!currentUser ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
                <Ticket className="mx-auto h-14 w-14 text-gray-300" strokeWidth={1.25} aria-hidden />
                <p className="mt-4 text-lg font-semibold text-gray-900">Connecte-toi pour voir tes billets</p>
                <p className="mt-2 text-gray-500">Tous tes achats validés apparaîtront ici.</p>
                {onLogin && (
                  <button
                    type="button"
                    onClick={onLogin}
                    className="mt-8 rounded-xl bg-festigo px-8 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-festigo-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2"
                  >
                    Se connecter
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="mb-8 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setTicketFilter('upcoming')}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                      ticketFilter === 'upcoming'
                        ? 'bg-white font-semibold text-festigo shadow-sm ring-1 ring-gray-200'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300/80'
                    }`}
                  >
                    À venir
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        ticketFilter === 'upcoming' ? 'bg-festigo/15 text-festigo' : 'bg-gray-300/80 text-gray-800'
                      }`}
                    >
                      {upcomingCount}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTicketFilter('past')}
                    className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                      ticketFilter === 'past'
                        ? 'bg-white font-semibold text-festigo shadow-sm ring-1 ring-gray-200'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300/80'
                    }`}
                  >
                    Passés
                  </button>
                </div>

                {ticketsError && (
                  <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {ticketsError}
                    <button
                      type="button"
                      onClick={() => void loadTickets()}
                      className="ml-3 font-semibold underline decoration-red-400 hover:text-red-950"
                    >
                      Réessayer
                    </button>
                  </div>
                )}

                <div className="space-y-6">
                  {ticketsLoading ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white px-6 py-24 text-center shadow-sm">
                      <Loader2 className="h-10 w-10 animate-spin text-festigo" aria-hidden />
                      <p className="mt-4 text-sm font-medium text-gray-600">Chargement de tes billets…</p>
                    </div>
                  ) : filteredTickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-20 text-center shadow-sm">
                      <Ticket className="h-16 w-16 text-gray-300" strokeWidth={1.25} aria-hidden />
                      <p className="mt-4 text-xl font-semibold text-gray-900">
                        {ticketFilter === 'upcoming' ? 'Aucun événement à venir' : 'Aucun événement passé'}
                      </p>
                      <p className="mt-2 max-w-sm text-gray-500">
                        Explore les concerts près de chez toi et ajoute des billets à ton portefeuille.
                      </p>
                      {onDiscoverEvents && ticketFilter === 'upcoming' && (
                        <button
                          type="button"
                          onClick={onDiscoverEvents}
                          className="mt-8 rounded-xl bg-amber-500 px-8 py-3 text-sm font-bold text-gray-900 shadow-md transition-all hover:bg-amber-400 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                        >
                          Découvrir des événements
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredTickets.map((ticket) => {
                      const monthShort = ticket.monthShort;
                      const dayNum = ticket.dayNum;

                      return (
                    <article
                      key={ticket.id}
                      className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-shadow hover:shadow-lg"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="flex shrink-0 flex-row items-center justify-between gap-4 bg-festigo px-6 py-5 text-white md:w-32 md:flex-col md:justify-center md:px-4 md:py-8">
                          <div className="text-center md:w-full">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">{monthShort}</p>
                            <p className="text-4xl font-black leading-none tracking-tight md:text-5xl">{dayNum}</p>
                            <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-white/70">
                              {ticket.yearStr}
                            </p>
                          </div>
                        </div>

                        <div className="min-w-0 flex-1 p-6 md:p-8">
                          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{ticket.eventName}</h3>
                              <p className="mt-1 font-mono text-xs text-gray-400">{ticket.orderNumber}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              
                              <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${getTicketTypeStyles(ticket.ticketType)}`}
                              >
                                {ticket.ticketType}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-8">
                            <div className="flex items-start gap-2 text-sm text-gray-500">
                              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                              <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Date & heure</p>
                                <p className="font-medium text-gray-900">{ticket.dateLabel}</p>
                                <p className="flex items-center gap-1.5 text-gray-500">
                                  <Clock className="h-3.5 w-3.5" aria-hidden />
                                  {ticket.timeLabel}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-gray-500">
                              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                              <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Lieu</p>
                                <p className="font-medium text-gray-900">{ticket.venue}</p>
                              </div>
                            </div>
                            
                          </div>

                          <div className="mt-6 flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleDownloadPdf(ticket)}
                              className="inline-flex items-center gap-2 rounded-lg bg-festigo px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-festigo-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2"
                            >
                              <Download className="h-4 w-4" />
                              Télécharger PDF
                            </button>
                            <button
                              type="button"
                              onClick={() => handleViewTicket(ticket)}
                              className="inline-flex items-center gap-1 text-sm font-medium text-festigo transition-colors hover:text-festigo-hover"
                            >
                              <QrCode className="h-4 w-4" />
                              Voir le billet
                            </button>
                            
                          </div>
                        </div>

                        <div className="relative flex flex-col items-center justify-center border-t-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-8 md:w-56 md:border-l-2 md:border-t-0 md:bg-white md:px-4">
                          <span className="absolute -top-2 left-1/2 hidden h-4 w-4 -translate-x-1/2 rounded-full bg-gray-50 ring-2 ring-white md:left-0 md:top-8 md:block md:translate-x-[-50%]" />
                          <span className="absolute -bottom-2 left-1/2 hidden h-4 w-4 -translate-x-1/2 rounded-full bg-gray-50 ring-2 ring-white md:left-0 md:bottom-8 md:block md:translate-x-[-50%]" />
                          <div className="flex w-36 flex-col items-center rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                            <FestigoEntryQrThumb className="h-24 w-24" />
                          </div>
                          <p className="mt-3 text-center text-xs text-gray-500">Scan à l&apos;entrée</p>
                          <p className="mt-1 font-mono text-[11px] text-gray-400">{ticket.qrCode}</p>
                        </div>
                      </div>
                    </article>
                  );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeView === 'favorites' && (
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900">Favoris</h2>
              <p className="mt-1 text-gray-500">Tes événements enregistrés</p>
            </div>

            {!currentUser ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
                <Bookmark className="mx-auto h-14 w-14 text-gray-300" strokeWidth={1.25} aria-hidden />
                <p className="mt-4 text-lg font-semibold text-gray-900">Connecte-toi pour voir tes favoris</p>
                {onLogin && (
                  <button
                    type="button"
                    onClick={onLogin}
                    className="mt-8 rounded-xl bg-festigo px-8 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-festigo-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2"
                  >
                    Se connecter
                  </button>
                )}
              </div>
            ) : favoritesLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-festigo" aria-hidden />
              </div>
            ) : favoritesError ? (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">{favoritesError}</div>
            ) : favoriteEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center shadow-sm">
                <Bookmark className="mx-auto h-16 w-16 text-gray-300" strokeWidth={1.5} />
                <p className="mt-4 font-medium text-gray-600">Aucun favori</p>
                <p className="mt-2 text-sm text-gray-500">Ajoute des événements depuis la découverte ou une fiche concert.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {favoriteEvents.map((event) => (
                  <div
                    key={event.id}
                    className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-shadow hover:shadow-lg"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={getFavoriteCardImageUrl(event.image)}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/login-branding.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/45" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleRemoveFavorite(event.id);
                        }}
                        title="Retirer des favoris"
                        className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-festigo/40 bg-white/95 text-festigo shadow-[0_2px_14px_rgba(18,84,132,0.22)] ring-1 ring-festigo/15 backdrop-blur-md transition-all duration-200 hover:bg-white hover:shadow-[0_4px_18px_rgba(18,84,132,0.28)] focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:scale-[0.96]"
                        aria-label="Retirer des favoris"
                        aria-pressed={true}
                      >
                        <Bookmark
                          className="h-[18px] w-[18px] shrink-0 fill-current transition-colors"
                          strokeWidth={2}
                          aria-hidden
                        />
                      </button>
                      <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-800 backdrop-blur-sm">
                        {event.genreMusical}
                      </span>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900">{event.nom}</h3>

                      <div className="mt-3 space-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 shrink-0" />
                          <span>
                            {event.date ? new Date(event.date).toLocaleDateString() : '—'} ·{' '}
                            {event.heure || '—'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span>{event.lieu}</span>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-end gap-4">
                        <button
                          type="button"
                          onClick={() => handleBuyNow(event.id)}
                          className="rounded-xl bg-festigo px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-festigo-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2"
                        >
                          Voir & billetterie
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === 'profile' && (
          <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
            <h2 className="text-3xl font-bold text-gray-900">Profil</h2>
            <p className="mt-1 text-gray-500">Tes informations personnelles</p>

            {!currentUser ? (
              <div className="mt-10 rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
                <p className="text-gray-600">Connecte-toi pour afficher et modifier ton profil.</p>
                {onLogin && (
                  <button
                    type="button"
                    onClick={onLogin}
                    className="mt-6 rounded-xl bg-festigo px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-festigo-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2"
                  >
                    Se connecter
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-10 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                <div className="mb-8 flex items-center gap-6 border-b border-gray-100 pb-8">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-festigo text-3xl font-bold text-white">
                    {getUserInitials(currentUser)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-bold text-gray-900">{getUserDisplayName(currentUser)}</h3>
                    <p className="truncate text-sm text-gray-500">{currentUser.email}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Nom complet</label>
                    <input
                      type="text"
                      key={`nom-${currentUser.id}`}
                      defaultValue={currentUser.nom}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-festigo focus:outline-none focus:ring-2 focus:ring-festigo/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">E-mail</label>
                    <input
                      type="email"
                      key={`email-${currentUser.id}`}
                      defaultValue={currentUser.email}
                      readOnly
                      className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700 shadow-sm"
                    />
                  </div>
                  
                </div>

                <button
                  type="button"
                  className="mt-8 rounded-xl bg-festigo px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-festigo-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2"
                >
                  Enregistrer
                </button>
              </div>
            )}
          </div>
        )}

        {activeView === 'settings' && (
          <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
            <h2 className="text-3xl font-bold text-gray-900">Sécurité & confidentialité</h2>
            <p className="mt-1 text-gray-500">Notifications et données personnelles</p>

            <div className="mt-10 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="mt-6 space-y-4">
                {[
                  'E-mails pour les événements à venir',
                  "Rappels 24 h avant l'événement",
                  'Offres et actualités FestiGo',
                ].map((setting, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-gray-100 py-4 last:border-0">
                    <span className="text-sm text-gray-700">{setting}</span>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" defaultChecked={index < 2} className="peer sr-only" />
                      <div className="relative h-6 w-11 rounded-full bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-festigo/25 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-festigo peer-checked:after:translate-x-full peer-checked:after:border-white" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'help' && (
          <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
            <h2 className="text-3xl font-bold text-gray-900">Aide & support</h2>
            <p className="mt-1 text-gray-500">Une question sur tes billets ou ton compte&nbsp;?</p>
            <div className="mt-10 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <p className="leading-relaxed text-gray-600">
                Consulte notre centre d&apos;aide ou contacte le support FestiGo. Nous répondons en général sous 24&nbsp;h
                ouvrées.
              </p>
              <a
                href="#"
                className="mt-6 inline-flex text-sm font-semibold text-festigo transition-colors hover:text-festigo"
              >
                Centre d&apos;aide →
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
