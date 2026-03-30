import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Share2, Bookmark, Music, Users, Star } from 'lucide-react';

interface EventDetailsProps {
  onBookTickets: () => void;
  onBack: () => void;
}

const heroImageUrl =
  'https://images.unsplash.com/photo-1596826793477-814a59819a7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600';

export function EventDetails({ onBookTickets, onBack }: EventDetailsProps) {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans antialiased lg:pb-0">
      <nav className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-4 md:gap-8">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              FestiGo<span className="text-festigo">.</span>
            </h1>
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-festigo focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2 rounded-md"
            >
              ← Retour aux événements
            </button>
          </div>
          
        </div>
      </nav>

      {/* Hero — bannière image + overlay */}
      <header className="relative isolate min-h-[320px] overflow-hidden md:min-h-[420px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImageUrl})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-slate-950/65" aria-hidden />
        <button
          type="button"
          onClick={() => setIsSaved((v) => !v)}
          className={`absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900/40 active:scale-[0.96] md:right-6 md:top-6 ${
            isSaved
              ? 'border-festigo/40 bg-white/95 text-festigo shadow-[0_2px_14px_rgba(18,84,132,0.22)] ring-1 ring-festigo/15 hover:bg-white hover:shadow-[0_4px_18px_rgba(18,84,132,0.28)]'
              : 'border-white/50 bg-white/80 text-gray-600 shadow-[0_2px_12px_rgba(15,23,42,0.12)] ring-1 ring-black/[0.06] hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-festigo hover:shadow-[0_6px_20px_rgba(15,23,42,0.18)]'
          }`}
          aria-label={isSaved ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          aria-pressed={isSaved}
        >
          <Bookmark
            className={`h-[18px] w-[18px] shrink-0 transition-colors ${isSaved ? 'fill-current' : 'fill-transparent'}`}
            strokeWidth={2}
            aria-hidden
          />
        </button>
        <div className="relative mx-auto flex h-full min-h-[320px] max-w-7xl flex-col justify-end px-4 pb-10 pt-24 md:min-h-[420px] md:px-6 md:pb-14">
          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
            <Music className="h-4 w-4 text-white/70" aria-hidden />
            <span className="text-sm font-semibold text-white/95">Electronic • Dance</span>
          </div>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
            Purple Lights Festival
          </h2>
          <p className="mt-2 text-lg text-slate-200">Presented by Various Artists</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              Saturday, July 15, 2026
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              8:00 PM – 11:30 PM
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              The Grand Arena, Los Angeles, CA
            </span>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-12 lg:col-span-8">
            <section>
              <h3 className="mb-4 border-b border-slate-200 pb-2 text-2xl font-semibold text-slate-900">
                À propos de cet événement
              </h3>
              <div className="prose prose-lg max-w-none leading-relaxed text-slate-600 prose-p:mb-4 prose-headings:text-slate-900 prose-a:text-festigo">
                <p>
                  Get ready for the most electrifying music experience of the summer! Purple Lights Festival brings
                  together the world's top electronic artists for an unforgettable night of music, lights, and pure
                  energy.
                </p>
                <p>
                  This year's lineup features internationally acclaimed DJs and producers who will transform The Grand
                  Arena into a sonic wonderland. Expect cutting-edge visual productions, immersive stage design, and a
                  sound system that will resonate through your soul.
                </p>
                <p className="mb-0">
                  Whether you're a dedicated electronic music enthusiast or simply looking for an incredible night out,
                  Purple Lights Festival promises an experience you'll never forget. Join thousands of music lovers as we
                  dance under purple lights until the early hours.
                </p>
              </div>
            </section>

            <section>
              <h3 className="mb-4 border-b border-slate-200 pb-2 text-2xl font-semibold text-slate-900">
                Artistes en vedette
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {[
                  { name: 'DJ Nexus', role: 'Headliner' },
                  { name: 'Luna Eclipse', role: 'Co-Headliner' },
                  { name: 'The Frequencies', role: 'Opening Act' },
                  { name: 'Midnight Pulse', role: 'Special Guest' },
                ].map((artist, index) => (
                  <div
                    key={index}
                    className="flex cursor-default items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition-colors hover:border-festigo/25 hover:bg-slate-50/80"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-festigo/10 text-festigo">
                      <Star className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">{artist.name}</p>
                      <p className="text-sm text-slate-500">{artist.role}</p>
                    </div>
                    <Users className="h-4 w-4 shrink-0 text-slate-300" aria-hidden />
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-4">
            <div className="space-y-6 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 md:p-8">
                <h4 className="mb-6 text-lg font-semibold text-slate-900">Détails de l'événement</h4>

                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-festigo/10">
                      <Calendar className="h-5 w-5 text-festigo" aria-hidden />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Date</p>
                      <p className="mt-0.5 font-semibold text-slate-900">Saturday, July 15, 2026</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-festigo/10">
                      <Clock className="h-5 w-5 text-festigo" aria-hidden />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Time</p>
                      <p className="mt-0.5 font-semibold text-slate-900">8:00 PM - 11:30 PM</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-festigo/10">
                      <MapPin className="h-5 w-5 text-festigo" aria-hidden />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Venue</p>
                      <p className="mt-0.5 font-semibold text-slate-900">The Grand Arena</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        1234 Music Boulevard
                        <br />
                        Los Angeles, CA 90028
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-100 pt-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Tranche de prix</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">€45 - €150</p>
                  <button
                    type="button"
                    onClick={onBookTickets}
                    className="mt-6 w-full rounded-xl bg-[#125484] py-4 text-base font-bold text-white shadow-md shadow-[#125484]/10 transition-all hover:-translate-y-0.5 hover:bg-[#125484]/80 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2"
                  >
                    Prendre mes billets
                  </button>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSaved((v) => !v)}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2 ${
                        isSaved
                          ? 'border-festigo/30 bg-festigo/10 text-festigo hover:border-festigo/40 hover:bg-festigo/15'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                      aria-pressed={isSaved}
                      aria-label={isSaved ? 'Retirer des favoris' : 'Sauvegarder dans les favoris'}
                    >
                      <Bookmark
                        className={`h-4 w-4 shrink-0 ${isSaved ? 'fill-current' : 'fill-transparent'}`}
                        strokeWidth={2}
                        aria-hidden
                      />
                      <span>{isSaved ? 'Enregistré' : 'Sauvegarder'}</span>
                    </button>
                    <button
                      type="button"
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2"
                    >
                      <Share2 className="h-4 w-4" aria-hidden />
                      <span>Partager</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg shadow-slate-200/40">
                <div className="relative aspect-square bg-slate-100">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-festigo shadow-lg">
                      <MapPin className="h-7 w-7 text-white" aria-hidden />
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-100 bg-white p-4">
                  <a
                    href="#"
                    className="text-sm font-semibold text-festigo transition-colors hover:text-festigo-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2 rounded"
                  >
                    View in Google Maps →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 p-4 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] backdrop-blur-md md:p-5 lg:hidden">
        <div className="container mx-auto flex max-w-7xl items-center justify-between gap-4 px-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">From</p>
            <p className="text-xl font-bold text-slate-900">€45</p>
          </div>
          <button
            type="button"
            onClick={onBookTickets}
            className="rounded-xl bg-amber-500 px-8 py-3.5 text-sm font-bold text-slate-900 shadow-md transition-all hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
          >
            Book Tickets
          </button>
        </div>
      </div>
    </div>
  );
}
