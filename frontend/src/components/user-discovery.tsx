import React, { useState, useCallback } from 'react';
import { Search, MapPin, Calendar, Bookmark } from 'lucide-react';

/** Libellés de filtres rapides (affichage uniquement — aucun handler de filtre côté client pour l’instant). */
const filterChips = ['All', 'Electro', 'Rock', 'Jazz', 'Indie', 'Hip Hop'] as const;

const events = [
  {
    id: 1,
    name: 'Purple Lights Festival',
    artist: 'Various Artists',
    date: 'July 15, 2026',
    time: '8:00 PM',
    venue: 'The Grand Arena',
    location: 'Los Angeles, CA',
    price: 'From €65',
    image: 'https://images.unsplash.com/photo-1596826793477-814a59819a7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwY3Jvd2QlMjBzdGFnZSUyMGxpZ2h0cyUyMHB1cnBsZXxlbnwxfHx8fDE3NzAwMjg1MjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Electro',
  },
  {
    id: 2,
    name: 'Electric Summer Sessions',
    artist: 'DJ Nexus',
    date: 'July 22, 2026',
    time: '10:00 PM',
    venue: 'Warehouse District',
    location: 'Brooklyn, NY',
    price: 'From €45',
    image: 'https://images.unsplash.com/photo-1761163924901-2ed45af2c8c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljJTIwbXVzaWMlMjBESiUyMHBlcmZvcm1pbmd8ZW58MXx8fHwxNzcwMDI4NTIzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Electro',
  },
  {
    id: 3,
    name: 'Rock The Valley',
    artist: 'The Reverberators',
    date: 'August 5, 2026',
    time: '7:00 PM',
    venue: 'Valley Stadium',
    location: 'Austin, TX',
    price: 'From €55',
    image: 'https://images.unsplash.com/photo-1718180789302-40b33a7a4148?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2NrJTIwYmFuZCUyMGxpdmUlMjBjb25jZXJ0fGVufDF8fHx8MTc3MDAyMzE2Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Rock',
  },
  {
    id: 4,
    name: 'Smooth Jazz Nights',
    artist: 'Marcus Henderson Quartet',
    date: 'August 12, 2026',
    time: '8:30 PM',
    venue: 'Blue Note Club',
    location: 'Chicago, IL',
    price: 'From €85',
    image: 'https://images.unsplash.com/photo-1768935434604-2301398d92d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXp6JTIwbXVzaWNpYW4lMjBzYXhvcGhvbmUlMjBwZXJmb3JtYW5jZXxlbnwxfHx8fDE3NzAwMjg1MjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Jazz',
  },
  {
    id: 5,
    name: 'Indie Collective Tour',
    artist: 'Moonlight Arcade',
    date: 'August 18, 2026',
    time: '9:00 PM',
    venue: 'The Underground',
    location: 'Portland, OR',
    price: 'From €35',
    image: 'https://images.unsplash.com/photo-1621276921502-c04982edd1ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpZSUyMGJhbmQlMjBjb25jZXJ0JTIwc3RhZ2V8ZW58MXx8fHwxNzY5OTM2NjkyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Indie',
  },
  {
    id: 6,
    name: 'Urban Beats Live',
    artist: 'MC Apex & The Crew',
    date: 'August 25, 2026',
    time: '8:00 PM',
    venue: 'Metro Sound Hall',
    location: 'Atlanta, GA',
    price: 'From €50',
    image: 'https://images.unsplash.com/photo-1704919265299-b3f59044c3df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXAlMjBob3AlMjBhcnRpc3QlMjBwZXJmb3JtaW5nJTIwbGl2ZXxlbnwxfHx8fDE3NzAwMjg1MjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Hip Hop',
  },
];

interface UserDiscoveryProps {
  onEventSelect?: (eventId: number) => void;
}

export function UserDiscovery({ onEventSelect }: UserDiscoveryProps) {
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(() => new Set());

  const toggleFavorite = useCallback((eventId: number) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  }, []);

  return (
    <div className="festigo-discovery-fade-in min-h-0 flex-1 bg-gray-50 font-sans antialiased">
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-10 text-center md:mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
            Trouve ton prochain concert
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-gray-500 md:text-lg">
            Découvre les prochains concerts de tes artistes préférés dans ta ville
          </p>
        </header>

        <div className="mb-10 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:mb-12 md:p-6">
          <div className="relative mx-auto max-w-3xl">
            <span className="pointer-events-none absolute left-5 top-1/2 z-10 -translate-y-1/2 text-gray-400">
              <Search className="h-5 w-5" aria-hidden />
            </span>
            <input
              type="text"
              placeholder="Recherchez un événement, une ville, un artiste…"
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-3.5 pl-14 pr-6 text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-festigo focus:bg-white focus:outline-none focus:ring-2 focus:ring-festigo/25 md:py-4 md:text-[15px]"
            />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 md:mt-7 md:justify-start">
            {filterChips.map((chip, index) => (
              <button
                key={chip}
                type="button"
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2 ${
                  index === 0
                    ? 'border-festigo bg-festigo text-white shadow-md shadow-festigo/15'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 md:text-2xl">Prochains événements</h3>
            <p className="mt-1 text-sm text-gray-500">Sélection mise à jour pour ta région</p>
          </div>
          <span className="text-sm font-medium tabular-nums text-gray-500">{events.length} événements</span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              onClick={() => onEventSelect?.(event.id)}
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-200">
                <img
                  src={event.image}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
                <div className="pointer-events-none absolute inset-0 bg-black/40" aria-hidden />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(event.id);
                  }}
                  className={`absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:scale-[0.96] ${
                    favoriteIds.has(event.id)
                      ? 'border-festigo/40 bg-white/95 text-festigo shadow-[0_2px_14px_rgba(18,84,132,0.22)] ring-1 ring-festigo/15 hover:bg-white hover:shadow-[0_4px_18px_rgba(18,84,132,0.28)]'
                      : 'border-white/50 bg-white/80 text-gray-600 shadow-[0_2px_12px_rgba(15,23,42,0.12)] ring-1 ring-black/[0.06] hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-festigo hover:shadow-[0_6px_20px_rgba(15,23,42,0.18)]'
                  }`}
                  aria-label={
                    favoriteIds.has(event.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'
                  }
                  aria-pressed={favoriteIds.has(event.id)}
                >
                  <Bookmark
                    className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                      favoriteIds.has(event.id) ? 'fill-current' : 'fill-transparent'
                    }`}
                    strokeWidth={2}
                    aria-hidden
                  />
                </button>
                <span className="absolute bottom-3 left-3 rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-festigo shadow-sm backdrop-blur-sm">
                  {event.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
                  <span className="line-clamp-1">
                    {event.date} • {event.time}
                  </span>
                </div>
                <h4 className="line-clamp-2 text-lg font-semibold leading-snug text-gray-900">{event.name}</h4>
                <div className="mt-2 flex items-start gap-2 text-sm text-gray-500">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                  <span className="line-clamp-2">
                    {event.venue}, {event.location}
                  </span>
                </div>
                <p className="mt-2 line-clamp-1 text-sm text-gray-600">{event.artist}</p>
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                  <span className="text-sm font-bold text-festigo">{event.price}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventSelect?.(event.id);
                    }}
                    className="rounded-lg bg-[#125484] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#125484]/80 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2"
                  >
                    Acheter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
