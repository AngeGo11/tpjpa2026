import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Share2, Bookmark, Music, Users, Star, ArrowLeft } from 'lucide-react';
import { eventService, Event } from '../services/eventService';
import { artisteService, Artiste } from '../services/artisteService';

interface EventDetailsProps {
  eventId: number; // Nouveau: on passe l'ID de l'événement à afficher
  onBookTickets: () => void;
  onBack: () => void;
}

export function EventDetails({ eventId, onBookTickets, onBack }: EventDetailsProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [mainArtist, setMainArtist] = useState<Artiste | null>(null);
  const [guestArtists, setGuestArtists] = useState<Artiste[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;

      try {
        setIsLoading(true);

        const eventData = await eventService.getEventById(eventId);
        setEvent(eventData);


        if (eventData.artistePrincipalId) {
          try {
            const artistData = await artisteService.getArtisteById(eventData.artistePrincipalId);
            setMainArtist(artistData);
          } catch (e) {
            console.error("Erreur lors de la récupération de l'artiste principal", e);
          }
        }

        // 3. Récupérer les artistes invités
        if (eventData.inviteIds && eventData.inviteIds.length > 0) {
           const guestsPromises = eventData.inviteIds.map(id =>
             artisteService.getArtisteById(id).catch(() => null)
           );
           const guests = await Promise.all(guestsPromises);
           // On filtre les null au cas où un appel échoue
           setGuestArtists(guests.filter(g => g !== null) as Artiste[]);
        }

      } catch (err: any) {
        console.error("Erreur lors du chargement des détails de l'événement:", err);
        setError("Impossible de charger les détails de l'événement.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  // Fonction utilitaire pour gérer les images venant du backend qui pourraient être invalides
  const getImageUrl = (imagePath: string | undefined | null) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1596826793477-814a59819a7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600';
    if (imagePath.includes('example.com')) return 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8Y29uY2VydHx8fHx8fDE2ODUzMjQyOTQ&ixlib=rb-4.0.3&q=80&w=1600';
    return imagePath;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-festigo border-t-transparent"></div>
          <p className="text-slate-600 font-medium">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
         <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Oups !</h2>
            <p className="text-slate-500 mb-6">{error || "Événement introuvable."}</p>
            <button
              onClick={onBack}
              className="rounded-lg bg-festigo px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-festigo/90"
            >
              Retourner aux événements
            </button>
         </div>
      </div>
    );
  }

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
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-festigo focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2 rounded-md"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux événements
            </button>
          </div>
        </div>
      </nav>

      {/* Hero — bannière image + overlay */}
      <header className="relative isolate min-h-[320px] overflow-hidden md:min-h-[420px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${getImageUrl(event.image)})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-slate-950/65" aria-hidden />
        
        <div className="relative mx-auto flex h-full min-h-[320px] max-w-7xl flex-col justify-end px-4 pb-10 pt-24 md:min-h-[420px] md:px-6 md:pb-14">
          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
            <Music className="h-4 w-4 text-white/70" aria-hidden />
            <span className="text-sm font-semibold text-white/95">{event.genreMusical}</span>
          </div>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
            {event.nom}
          </h2>
          {mainArtist && (
             <p className="mt-2 text-lg text-slate-200">Avec {mainArtist.nomArtiste}</p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              {event.date ? new Date(event.date).toLocaleDateString() : 'Date non définie'}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              {event.heure || 'Heure non définie'}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              {event.lieu}
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
                  {event.description || "Aucune description n'a été fournie pour cet événement."}
                </p>
              </div>
            </section>

            {(mainArtist || guestArtists.length > 0) && (
              <section>
                <h3 className="mb-4 border-b border-slate-200 pb-2 text-2xl font-semibold text-slate-900">
                  Artistes en vedette
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  {/* Affichage de l'artiste principal */}
                  {mainArtist && (
                    <div className="flex cursor-default items-center gap-3 rounded-xl border border-festigo/30 bg-festigo/5 px-4 py-3.5 transition-colors hover:border-festigo/50 hover:bg-festigo/10">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-festigo text-white">
                        <Star className="h-5 w-5" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900">{mainArtist.nomArtiste}</p>
                        <p className="text-sm text-festigo font-medium">Headliner</p>
                      </div>
                      {mainArtist.photoUrl && !mainArtist.photoUrl.includes("example.com") && (
                         <img src={mainArtist.photoUrl} alt={mainArtist.nomArtiste} className="h-10 w-10 rounded-full object-cover shadow-sm" />
                      )}
                    </div>
                  )}

                  {/* Affichage des artistes invités */}
                  {guestArtists.map((artist, index) => (
                    <div
                      key={index}
                      className="flex cursor-default items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition-colors hover:border-festigo/25 hover:bg-slate-50/80"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <Users className="h-4 w-4" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900">{artist.nomArtiste}</p>
                        <p className="text-sm text-slate-500">Special Guest</p>
                      </div>
                       {artist.photoUrl && !artist.photoUrl.includes("example.com") && (
                         <img src={artist.photoUrl} alt={artist.nomArtiste} className="h-10 w-10 rounded-full object-cover shadow-sm" />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
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
                      <p className="mt-0.5 font-semibold text-slate-900">
                        {event.date ? new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Non définie'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-festigo/10">
                      <Clock className="h-5 w-5 text-festigo" aria-hidden />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Heure</p>
                      <p className="mt-0.5 font-semibold text-slate-900">{event.heure || 'Non définie'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-festigo/10">
                      <MapPin className="h-5 w-5 text-festigo" aria-hidden />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Lieu</p>
                      <p className="mt-0.5 font-semibold text-slate-900">{event.lieu}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-festigo/10">
                      <Users className="h-5 w-5 text-festigo" aria-hidden />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Capacité</p>
                      <p className="mt-0.5 font-semibold text-slate-900">{event.nbPlaces} places</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-100 pt-6">
                  {/* Ici on pourrait faire un appel à typeBilletService pour avoir le vrai prix */}
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Billetterie</p>
                  <button
                    type="button"
                    onClick={onBookTickets}
                    className="mt-4 w-full rounded-xl bg-[#125484] py-4 text-base font-bold text-white shadow-md shadow-[#125484]/10 transition-all hover:-translate-y-0.5 hover:bg-[#125484]/80 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2"
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
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 p-4 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] backdrop-blur-md md:p-5 lg:hidden">
        <div className="container mx-auto flex max-w-7xl items-center justify-between gap-4 px-2">
          <button
            type="button"
            onClick={onBookTickets}
            className="w-full rounded-xl bg-amber-500 px-8 py-3.5 text-sm font-bold text-slate-900 shadow-md transition-all hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
          >
            Acheter des billets
          </button>
        </div>
      </div>
    </div>
  );
}
