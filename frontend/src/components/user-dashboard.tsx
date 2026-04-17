import React, { useState } from 'react';
import { Ticket, Bookmark, Download, Send, QrCode, Calendar, MapPin, Clock } from 'lucide-react';
import { authService } from '../services/authService';
import { getUserDisplayName, getUserFirstName, getUserInitials } from '../services/userService';

export type UserDashboardView = 'tickets' | 'favorites' | 'profile' | 'settings' | 'help';
export type FanAppSection = 'discovery' | UserDashboardView;
type TicketStatus = 'upcoming' | 'past';

interface TicketData {
  id: number;
  eventName: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  ticketType: string;
  seatNumber: string;
  status: TicketStatus;
  qrCode: string;
  orderNumber: string;
}

interface FavoriteEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  venue: string;
  image: string;
  price: number;
  category: string;
}

const mockTickets: TicketData[] = [
  {
    id: 1,
    eventName: 'Summer Jazz Festival',
    date: 'July 15, 2026',
    time: '8:00 PM',
    venue: 'Blue Note Arena',
    location: 'Chicago, IL',
    ticketType: 'VIP Access',
    seatNumber: 'A-12',
    status: 'upcoming',
    qrCode: 'QR_12345',
    orderNumber: '#ORD-2026-001',
  },
  {
    id: 2,
    eventName: 'Electric Nights',
    date: 'July 22, 2026',
    time: '10:00 PM',
    venue: 'Metro Electronic Hall',
    location: 'Brooklyn, NY',
    ticketType: 'GrandPublic',
    seatNumber: 'C-45',
    status: 'upcoming',
    qrCode: 'QR_12346',
    orderNumber: '#ORD-2026-002',
  },
  {
    id: 3,
    eventName: 'Rock the Valley',
    date: 'August 5, 2026',
    time: '7:00 PM',
    venue: 'Valley Stadium',
    location: 'Austin, TX',
    ticketType: 'VVIP',
    seatNumber: 'B-28',
    status: 'upcoming',
    qrCode: 'QR_12347',
    orderNumber: '#ORD-2026-003',
  },
  {
    id: 4,
    eventName: 'Classical Night',
    date: 'January 15, 2026',
    time: '7:30 PM',
    venue: 'Symphony Hall',
    location: 'Boston, MA',
    ticketType: 'GrandPublic',
    seatNumber: 'D-56',
    status: 'past',
    qrCode: 'QR_12348',
    orderNumber: '#ORD-2025-045',
  },
];

const mockFavorites: FavoriteEvent[] = [
  {
    id: 1,
    title: 'Indie Collective Tour',
    date: 'August 18, 2026',
    time: '9:00 PM',
    venue: 'The Underground',
    image:
      'https://images.unsplash.com/photo-1767462372392-31b5b98e480e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpZSUyMGJhbmQlMjBwZXJmb3JtYW5jZSUyMHZlbnVlfGVufDF8fHx8MTc3MDAyOTc3MHww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 45,
    category: 'Indie',
  },
  {
    id: 2,
    title: 'Jazz Masters Series',
    date: 'September 5, 2026',
    time: '8:00 PM',
    venue: 'Smooth Jazz Club',
    image:
      'https://images.unsplash.com/photo-1757439160077-dd5d62a4d851?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXp6JTIwY29uY2VydCUyMGxpdmUlMjBwZXJmb3JtYW5jZXxlbnwxfHx8fDE3NzAwMjk3Njl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 75,
    category: 'Jazz',
  },
  {
    id: 3,
    title: 'Electronic Waves',
    date: 'September 12, 2026',
    time: '11:00 PM',
    venue: 'Warehouse District',
    image:
      'https://images.unsplash.com/photo-1624703307604-744ec383cbf4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljJTIwbXVzaWMlMjBmZXN0aXZhbCUyMGRqfGVufDF8fHx8MTc2OTk5ODc4M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 55,
    category: 'Electronic',
  },
  {
    id: 4,
    title: 'Rock Legends Live',
    date: 'September 20, 2026',
    time: '7:30 PM',
    venue: 'Arena Center',
    image:
      'https://images.unsplash.com/photo-1683612491338-ab87b7ac6583?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2NrJTIwY29uY2VydCUyMHN0YWdlJTIwbGlnaHRzfGVufDF8fHx8MTc3MDAyOTc3MHww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 85,
    category: 'Rock',
  },
];

export function getUserAccountMenuBadgeCounts() {
  return {
    upcomingTickets: mockTickets.filter((t) => t.status === 'upcoming').length,
    favorites: mockFavorites.length,
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
}

export function UserDashboard({ onDiscoverEvents, onLogin, activeView }: UserDashboardProps) {
  const currentUser = authService.getCurrentUser();
  const firstName = currentUser ? getUserFirstName(currentUser) : null;
  const [ticketFilter, setTicketFilter] = useState<TicketStatus>('upcoming');

  const filteredTickets = mockTickets.filter((ticket) => ticket.status === ticketFilter);

  const getTicketTypeStyles = (type: string) => {
    switch (type.toLowerCase()) {
      case 'vip access':
        return 'bg-festigo/10 text-festigo border border-festigo/20';
      case 'VVIP':
        return 'bg-festigo/10 text-festigo border border-festigo/25';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const handleDownload = (ticketId: number) => {
    console.log('Downloading ticket:', ticketId);
  };

  const handleTransfer = (ticketId: number) => {
    console.log('Transferring ticket:', ticketId);
  };

  const handleRemoveFavorite = (eventId: number) => {
    console.log('Removing favorite:', eventId);
  };

  const handleBuyNow = (eventId: number) => {
    console.log('Buying ticket for event:', eventId);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gray-50">
      <main className={`min-h-0 flex-1 overflow-auto ${activeView === 'tickets' ? 'bg-gray-50' : 'bg-gray-50/90'}`}>
        {activeView === 'tickets' && (
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
            <div className="mb-8">
              <h2 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">
                Bonjour{firstName ? `, ${firstName}` : ''}
              </h2>
              <p className="text-gray-500">Tes billets, au format portefeuille numérique.</p>
            </div>

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
                  {mockTickets.filter((t) => t.status === 'upcoming').length}
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

            <div className="space-y-6">
              {filteredTickets.length === 0 ? (
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
                  const parts = ticket.date.split(' ');
                  const monthShort = (parts[0] ?? '—').slice(0, 3).toUpperCase();
                  const dayNum = (parts[1] ?? '').replace(',', '') || '—';

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
                              {parts[2] ?? ''}
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
                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                                  ticket.status === 'upcoming'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {ticket.status === 'upcoming' ? 'Confirmé' : 'Terminé'}
                              </span>
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
                                <p className="font-medium text-gray-900">{ticket.date}</p>
                                <p className="flex items-center gap-1.5 text-gray-500">
                                  <Clock className="h-3.5 w-3.5" aria-hidden />
                                  {ticket.time}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-gray-500">
                              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                              <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Lieu</p>
                                <p className="font-medium text-gray-900">{ticket.venue}</p>
                                <p>{ticket.location}</p>
                              </div>
                            </div>
                            
                          </div>

                          <div className="mt-6 flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleDownload(ticket.id)}
                              className="inline-flex items-center gap-2 rounded-lg bg-festigo px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-festigo-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2"
                            >
                              <Download className="h-4 w-4" />
                              Télécharger PDF
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownload(ticket.id)}
                              className="inline-flex items-center gap-1 text-sm font-medium text-festigo transition-colors hover:text-festigo"
                            >
                              <QrCode className="h-4 w-4" />
                              Voir le billet
                            </button>
                            {ticket.status === 'upcoming' && (
                              <button
                                type="button"
                                onClick={() => handleTransfer(ticket.id)}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2"
                              >
                                <Send className="h-4 w-4" />
                                Transférer
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="relative flex flex-col items-center justify-center border-t-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-8 md:w-56 md:border-l-2 md:border-t-0 md:bg-white md:px-4">
                          <span className="absolute -top-2 left-1/2 hidden h-4 w-4 -translate-x-1/2 rounded-full bg-gray-50 ring-2 ring-white md:left-0 md:top-8 md:block md:translate-x-[-50%]" />
                          <span className="absolute -bottom-2 left-1/2 hidden h-4 w-4 -translate-x-1/2 rounded-full bg-gray-50 ring-2 ring-white md:left-0 md:bottom-8 md:block md:translate-x-[-50%]" />
                          <div className="flex w-36 flex-col items-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                            <QrCode className="h-20 w-20 text-festigo" aria-hidden />
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
          </div>
        )}

        {activeView === 'favorites' && (
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900">Favoris</h2>
              <p className="mt-1 text-gray-500">Tes événements enregistrés</p>
            </div>

            {mockFavorites.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center shadow-sm">
                <Bookmark className="mx-auto h-16 w-16 text-gray-300" strokeWidth={1.5} />
                <p className="mt-4 font-medium text-gray-600">Aucun favori</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {mockFavorites.map((event) => (
                  <div
                    key={event.id}
                    className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-shadow hover:shadow-lg"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={event.image}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-black/45" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(event.id);
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
                        {event.category}
                      </span>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>

                      <div className="mt-3 space-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 shrink-0" />
                          <span>
                            {event.date} · {event.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span>{event.venue}</span>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">À partir de</p>
                          <p className="text-2xl font-bold text-gray-900">€{event.price}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleBuyNow(event.id)}
                          className="rounded-xl bg-festigo px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-festigo-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2"
                        >
                          Acheter
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
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Téléphone</label>
                    <input
                      type="tel"
                      placeholder="Non renseigné"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:border-festigo focus:outline-none focus:ring-2 focus:ring-festigo/20"
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
