import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Ticket,
  Calendar,
  Users,
  Settings,
  TrendingUp,
  DollarSign,
  Plus,
  MapPin,
  Clock,
  Image as ImageIcon,
  Tag,
  FileText,
  Save,
  Music,
  X,
  Bell,
  Pencil,
  Eye,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { eventService, Event, GenreMusical } from '../services/eventService';
import { authService } from '../services/authService';
import { artisteService, Artiste } from '../services/artisteService';

type OrganizerView = 'dashboard' | 'my-events';

const salesData = [
  { month: 'Jan', revenue: 0 },
  { month: 'Feb', revenue: 0 },
  { month: 'Mar', revenue: 0 },
  { month: 'Apr', revenue: 0 },
  { month: 'May', revenue: 0 },
  { month: 'Jun', revenue: 0 },
];

const inputFocusClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm transition-colors focus:border-festigo focus:outline-none focus:ring-2 focus:ring-festigo/20';

const selectFieldClass = `${inputFocusClass} cursor-pointer appearance-none pr-10`;
const sectionCardClass = 'rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8';
export function OrganizerDashboard() {
  const [view, setView] = useState<OrganizerView>('dashboard');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const currentUser = authService.getCurrentUser();
  const organizerName = currentUser?.nomOrganisation || currentUser?.nom || 'Organisateur';

  const [availableArtists, setAvailableArtists] = useState<Artiste[]>([]);

  const [artists, setArtists] = useState<
    Array<{ id: number; dbId: number | null; name: string; role: string; imageName: string; imagePreview: string; imageFile: File | null }>
  >([
    { id: 1, dbId: null, name: '', role: 'headliner', imageName: '', imagePreview: '', imageFile: null },
  ]);

  const [eventFormData, setEventFormData] = useState({
    eventName: '',
    eventDate: '',
    eventTime: '',
    venue: '',
    address: '',
    city: '',
    capacity: '',
    description: '',
    category: '',
    standardPrice: '',
    standardQuantity: '',
    premiumPrice: '',
    premiumQuantity: '',
    vipPrice: '',
    vipQuantity: '',
    eventImageName: '',
    eventImagePreview: '',
    eventImageFile: null as File | null,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{text: string, type: 'success'|'error'} | null>(null);

  useEffect(() => {
    fetchMyEvents();
    fetchArtists();
  }, []);

  const fetchMyEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const allEvents = await eventService.getAllEvents();
      if (currentUser?.id) {
        const myEvents = allEvents.filter(e => e.organizerId === currentUser.id);
        setEvents(myEvents);
      } else {
        setEvents(allEvents);
      }
    } catch (err) {
      console.error("Erreur chargement événements", err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const fetchArtists = async () => {
    try {
      const arts = await artisteService.getAllArtistes();
      setAvailableArtists(arts);
    } catch (err) {
      console.error("Erreur chargement artistes", err);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEventFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addArtist = () => {
    setArtists([...artists, { id: Date.now(), dbId: null, name: '', role: 'supporting', imageName: '', imagePreview: '', imageFile: null }]);
  };

  const removeArtist = (id: number) => {
    if (artists.length > 1) {
      setArtists(artists.filter((artist) => artist.id !== id));
    }
  };

  const updateArtist = (id: number, field: 'name' | 'role' | 'imageName' | 'imagePreview' | 'dbId', value: any) => {
    setArtists(artists.map((artist) => (artist.id === id ? { ...artist, [field]: value } : artist)));
  };

  const handleArtistImageUpload = (id: number, file: File | null) => {
    if (!file) {
      setArtists(artists.map((artist) => (artist.id === id ? { ...artist, imageName: '', imagePreview: '', imageFile: null } : artist)));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setArtists(
        artists.map((artist) =>
          artist.id === id ? { ...artist, imageName: file.name, imagePreview: String(reader.result || ''), imageFile: file } : artist
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const handleEventImageUpload = (file: File | null) => {
    if (!file) {
      setEventFormData((prev) => ({ ...prev, eventImageName: '', eventImagePreview: '', eventImageFile: null }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setEventFormData((prev) => ({
        ...prev,
        eventImageName: file.name,
        eventImagePreview: String(reader.result || ''),
        eventImageFile: file,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEvent = async () => {
    if (!currentUser || !currentUser.id) {
       setSaveMessage({text: "Erreur : Vous devez être connecté pour créer un événement.", type: 'error'});
       return;
    }

    if (!eventFormData.eventName || !eventFormData.category || !eventFormData.eventDate || !eventFormData.capacity) {
      setSaveMessage({text: "Erreur : Veuillez remplir tous les champs obligatoires (*).", type: 'error'});
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      // 1. Trouver ou créer l'artiste principal
      const headlinerInput = artists.find(a => a.role === 'headliner');
      let artistePrincipalId: number;

      if (!headlinerInput || !headlinerInput.name) {
         throw new Error("Un artiste principal est requis.");
      }

      let foundArtist = availableArtists.find(a =>
        (a.nomArtiste && a.nomArtiste.toLowerCase() === headlinerInput.name.toLowerCase()) ||
        (a.nom && a.nom.toLowerCase() === headlinerInput.name.toLowerCase())
      );

      if (foundArtist && foundArtist.id) {
         artistePrincipalId = foundArtist.id;
         if (headlinerInput.imageFile) {
            await artisteService.uploadArtisteImage(artistePrincipalId, headlinerInput.imageFile);
         }
      } else {
         const newArtist = await artisteService.createArtiste({
            nomArtiste: headlinerInput.name,
            nom: headlinerInput.name, // Renseigne les deux pour éviter le bug DTO
            photoUrl: ''
         });
         artistePrincipalId = newArtist.id!;
         if (headlinerInput.imageFile) {
            await artisteService.uploadArtisteImage(artistePrincipalId, headlinerInput.imageFile);
         }
         setAvailableArtists([...availableArtists, newArtist]);
      }

      // 2. Traiter les invités
      const guestInputs = artists.filter(a => a.role === 'supporting' && a.name.trim() !== '');
      const inviteIds: number[] = [];

      for (const guest of guestInputs) {
         let fGuest = availableArtists.find(a =>
           (a.nomArtiste && a.nomArtiste.toLowerCase() === guest.name.toLowerCase()) ||
           (a.nom && a.nom.toLowerCase() === guest.name.toLowerCase())
         );

         if (fGuest && fGuest.id) {
            inviteIds.push(fGuest.id);
            if (guest.imageFile) {
              await artisteService.uploadArtisteImage(fGuest.id, guest.imageFile);
            }
         } else {
            const nGuest = await artisteService.createArtiste({
               nomArtiste: guest.name,
               nom: guest.name,
               photoUrl: ''
            });
            inviteIds.push(nGuest.id!);
            if (guest.imageFile) {
              await artisteService.uploadArtisteImage(nGuest.id!, guest.imageFile);
            }
            setAvailableArtists(prev => [...prev, nGuest]);
         }
      }

      // 3. Convertir le genre musical
      let genre = GenreMusical.POP;
      const cat = eventFormData.category.toUpperCase();
      if (Object.values(GenreMusical).includes(cat as any)) {
         genre = cat as GenreMusical;
      } else if (cat === 'ELECTRONIC') { genre = GenreMusical.ELECTRO; }

      const eventDate = new Date(eventFormData.eventDate);

      const newEventData: any = {
         nom: eventFormData.eventName,
         description: eventFormData.description || "Description vide",
         lieu: `${eventFormData.venue}, ${eventFormData.address}, ${eventFormData.city}`,
         date: eventDate.toISOString(),
         heure: eventFormData.eventTime ? `${eventFormData.eventTime}:00` : "20:00:00",
         nbPlaces: parseInt(eventFormData.capacity) || 100,
         organizerId: currentUser.id,
         genreMusical: genre,
         artistePrincipalId: artistePrincipalId,
         inviteIds: inviteIds,
         image: ''
      };

      const createdEvent = await eventService.createEvent(newEventData);
      if (eventFormData.eventImageFile && createdEvent.id) {
        await eventService.uploadEventImage(createdEvent.id, eventFormData.eventImageFile);
      }

      setSaveMessage({text: "L'événement a été créé avec succès !", type: 'success'});

      setEventFormData({
        eventName: '', eventDate: '', eventTime: '', venue: '', address: '', city: '',
        capacity: '', description: '', category: '',
        standardPrice: '', standardQuantity: '', premiumPrice: '', premiumQuantity: '',
        vipPrice: '', vipQuantity: '',
        eventImageName: '', eventImagePreview: '', eventImageFile: null,
      });
      setArtists([{ id: 1, dbId: null, name: '', role: 'headliner', imageName: '', imagePreview: '', imageFile: null }]);

      fetchMyEvents();
      setTimeout(() => setView('dashboard'), 1500);

    } catch (err: any) {
      console.error("Détail de l'erreur lors de la sauvegarde:", err);
      setSaveMessage({
        text: `Erreur lors de la création: ${err.message || 'Problème serveur'}`,
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const navBtn = (active: boolean) =>
    `flex w-full items-center gap-3 rounded-lg py-2.5 pl-3 pr-4 text-left text-sm transition-colors ${
      active
        ? 'border-l-4 border-festigo bg-festigo/10 font-medium text-festigo'
        : 'border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  const totalCapacity = events.reduce((sum, e) => sum + (e.nbPlaces || 0), 0);

  return (
    <div className="flex h-screen bg-slate-50 font-sans antialiased">
      <aside className="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-5">
          <h1 className="text-lg font-bold tracking-tight text-gray-900">
            FestiGo<span className="text-festigo">.</span>
          </h1>
          <p className="mt-0.5 text-xs font-medium text-gray-500">Organizer Panel</p>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          <button type="button" onClick={() => setView('dashboard')} className={navBtn(view === 'dashboard')}>
            <LayoutDashboard className="h-5 w-5 shrink-0 opacity-80" />
            <span>Dashboard</span>
          </button>
          <button type="button" onClick={() => setView('my-events')} className={navBtn(view === 'my-events')}>
            <Ticket className="h-5 w-5 shrink-0 opacity-80" />
            <span>Créer un événement</span>
          </button>
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50 cursor-pointer" onClick={() => {
              authService.logout();
              window.location.reload();
          }}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-festigo text-xs font-semibold text-white uppercase">
              {organizerName.substring(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">{organizerName}</p>
              <p className="truncate text-xs text-red-500 hover:text-red-700">Se déconnecter</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 md:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              {view === 'dashboard' ? 'Vue d’ensemble' : 'Événements'}
            </p>
            <h2 className="text-lg font-semibold text-gray-900">
              {view === 'dashboard' ? 'Tableau de bord' : 'Créer un événement'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {view === 'dashboard' && (
              <button
                type="button"
                onClick={() => setView('my-events')}
                className="inline-flex items-center gap-2 rounded-lg bg-festigo px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-festigo-hover hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2"
              >
                <Plus className="h-4 w-4" />
                Nouvel événement
              </button>
            )}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-festigo text-xs font-semibold text-white uppercase">
               {organizerName.substring(0, 2)}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {view === 'dashboard' && (
            <div className="p-6 md:p-8">
              <div className="mb-8">
                <p className="text-sm text-gray-500">
                  Bienvenue, <span className="font-medium text-gray-700">{organizerName}</span>
                </p>
              </div>

              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-festigo/10">
                      <DollarSign className="h-6 w-6 text-festigo" />
                    </div>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Revenue Estimé</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">-- €</p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-festigo/10">
                      <Ticket className="h-6 w-6 text-festigo" />
                    </div>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Capacité Totale</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{totalCapacity}</p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-festigo/10">
                      <Calendar className="h-6 w-6 text-festigo" />
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Actifs
                    </span>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Vos événements</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{events.length}</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-5">
                  <h3 className="text-lg font-semibold text-gray-900">Vos événements créés</h3>
                </div>
                <div className="overflow-x-auto">
                  <div className="min-w-[880px]">
                    <div className="grid grid-cols-12 gap-4 border-b border-gray-200 bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      <div className="col-span-3">Nom de l'événement</div>
                      <div className="col-span-2">Date</div>
                      <div className="col-span-3">Lieu</div>
                      <div className="col-span-2">Capacité</div>
                      <div className="col-span-2 text-right">Actions</div>
                    </div>

                    {isLoadingEvents ? (
                       <div className="py-8 text-center text-gray-500">Chargement de vos événements...</div>
                    ) : events.length === 0 ? (
                       <div className="py-8 text-center text-gray-500">
                         Vous n'avez pas encore créé d'événements.<br/>
                         Cliquez sur "Nouvel événement" pour commencer !
                       </div>
                    ) : (
                      events.map((event) => (
                        <div
                          key={event.id}
                          className="grid grid-cols-12 items-center gap-4 border-b border-gray-100 px-6 py-4 transition-colors last:border-b-0 hover:bg-gray-50"
                        >
                          <div className="col-span-3">
                            <p className="font-semibold text-gray-900">{event.nom}</p>
                            <p className="text-xs text-gray-500">{event.genreMusical}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-500">
                               {event.date ? new Date(event.date).toLocaleDateString() : ''}
                            </p>
                            <p className="text-xs text-gray-400">{event.heure}</p>
                          </div>
                          <div className="col-span-3">
                            <p className="text-sm text-gray-700 truncate pr-2">{event.lieu}</p>
                          </div>
                          <div className="col-span-2">
                             <span className="whitespace-nowrap text-sm text-gray-600 font-medium">
                               {event.nbPlaces} places
                             </span>
                          </div>

                          <div className="col-span-2 flex justify-end gap-1">
                            <button
                              type="button"
                              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white hover:text-red-600 hover:shadow-sm"
                              title="Fonctionnalité en cours de développement"
                              onClick={() => alert(`Suppression de l'événement ID: ${event.id} non implémentée.`)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === 'my-events' && (
            <div className="p-6 md:p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Créer un nouvel événement</h2>
                <p className="mt-1 text-sm text-gray-500">Planifiez et publiez votre prochain concert</p>
              </div>

              {saveMessage && (
                <div className={`mb-6 p-4 rounded-lg ${saveMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {saveMessage.text}
                </div>
              )}

              <div className="mx-auto max-w-4xl">
                <div className={`${sectionCardClass} mb-6`}>
                  <div className="mb-8 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-festigo/10">
                      <FileText className="h-5 w-5 text-festigo" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Informations de l&apos;événement</h3>
                      <p className="text-sm text-gray-500">Informations de base sur votre événement</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Nom de l&apos;événement *</label>
                      <input
                        type="text"
                        required
                        value={eventFormData.eventName}
                        onChange={(e) => handleInputChange('eventName', e.target.value)}
                        placeholder="Ex: Les Nuits Botaniques"
                        className={inputFocusClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Genre musical *</label>
                      <div className="relative">
                        <select
                          required
                          value={eventFormData.category}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          className={selectFieldClass}
                        >
                          <option value="">Sélectionner un genre</option>
                          <option value="POP">Pop</option>
                          <option value="ROCK">Rock</option>
                          <option value="SHATTA">Shatta</option>
                          <option value="JAZZ">Jazz</option>
                          <option value="HIP_HOP">Hip Hop</option>
                          <option value="ELECTRO">Electro</option>
                          <option value="RAP">Rap</option>
                        </select>
                        <ChevronDown
                          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                          aria-hidden
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Description de l&apos;événement *
                      </label>
                      <textarea
                        value={eventFormData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Décrivez votre événement..."
                        rows={4}
                        className={`${inputFocusClass} resize-none`}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Image de l&apos;événement</label>
                      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-3">
                        <input
                          id="event-image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleEventImageUpload(e.target.files?.[0] ?? null)}
                        />
                        <div className="flex h-24 w-40 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-festigo/20 bg-gradient-to-br from-festigo/10 to-violet-100">
                          {eventFormData.eventImagePreview ? (
                            <img
                              src={eventFormData.eventImagePreview}
                              alt={`Affiche de ${eventFormData.eventName || 'événement'}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-8 w-8 text-festigo/60" />
                          )}
                        </div>
                        <div className="min-w-0 space-y-2">
                          <label
                            htmlFor="event-image-upload"
                            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-festigo px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-festigo-hover"
                          >
                            <ImageIcon className="h-3.5 w-3.5" />
                            {eventFormData.eventImageName ? "Changer l'image" : "Uploader une image"}
                          </label>
                          <p className="truncate text-xs text-gray-500">
                            {eventFormData.eventImageName || 'Format recommandé: paysage (ex: 1600x900)'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`${sectionCardClass} mb-6`}>
                  <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-festigo/10">
                        <Music className="h-5 w-5 text-festigo" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Line-up artistes</h3>
                        <p className="text-sm text-gray-500">Ajouter des artistes et performers (Le premier sera principal)</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={addArtist}
                      className="inline-flex items-center gap-2 rounded-lg bg-festigo px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-festigo-hover"
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter un artiste
                    </button>
                  </div>

                  <div className="space-y-4">
                    {artists.map((artist, _index) => (
                      <div key={artist.id} className="rounded-xl border border-gray-200 bg-gray-50/50 p-5">
                        <div className="flex items-start gap-4">
                          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-xs font-medium text-gray-500">
                                Nom de l&apos;artiste *
                              </label>
                              <input
                                type="text"
                                required
                                value={artist.name}
                                onChange={(e) => updateArtist(artist.id, 'name', e.target.value)}
                                placeholder="Nom de l'artiste"
                                className={inputFocusClass}
                              />
                            </div>
                            <div>
                              <label className="mb-2 block text-xs font-medium text-gray-500">Rôle *</label>
                              <div className="relative">
                                <select
                                  value={artist.role}
                                  onChange={(e) => updateArtist(artist.id, 'role', e.target.value)}
                                  className={selectFieldClass}
                                >
                                  <option value="headliner">Artiste principal</option>
                                  <option value="supporting">Artiste invité</option>
                                </select>
                                <ChevronDown
                                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                                  aria-hidden
                                />
                              </div>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="mb-2 block text-xs font-medium text-gray-500">Image artiste</label>
                              <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-3">
                                <input
                                  id={`artist-image-${artist.id}`}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleArtistImageUpload(artist.id, e.target.files?.[0] ?? null)}
                                />
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-festigo/15 bg-gradient-to-br from-festigo/10 to-violet-100">
                                  {artist.imagePreview ? (
                                    <img
                                      src={artist.imagePreview}
                                      alt={`Photo de ${artist.name || 'artiste'}`}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <ImageIcon className="h-8 w-8 text-festigo/60" />
                                  )}
                                </div>
                                <div className="min-w-0 space-y-2">
                                  <label
                                    htmlFor={`artist-image-${artist.id}`}
                                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-festigo px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-festigo-hover"
                                  >
                                    <ImageIcon className="h-3.5 w-3.5" />
                                    {artist.imageName ? 'Changer la photo' : 'Uploader une photo'}
                                  </label>
                                  <p className="truncate text-xs text-gray-500">
                                    {artist.imageName || 'Format recommandé: carré (ex: 600x600)'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          {artists.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArtist(artist.id)}
                              className="mt-6 rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                              aria-label="Remove artist"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                        {artist.role === 'headliner' && (
                          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-festigo">
                            <div className="h-2 w-2 rounded-full bg-festigo" />
                            <span>Artiste principal (Sera mis en avant)</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`${sectionCardClass} mb-6`}>
                  <div className="mb-8 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-festigo/10">
                      <MapPin className="h-5 w-5 text-festigo" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Date & lieu</h3>
                      <p className="text-sm text-gray-500">Quand et où se déroulera l&apos;événement</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Date *</label>
                        <div className="relative">
                          <Calendar className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                          <input
                            type="date"
                            required
                            value={eventFormData.eventDate}
                            onChange={(e) => handleInputChange('eventDate', e.target.value)}
                            className={`${inputFocusClass} pl-12`}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Heure de début *</label>
                        <div className="relative">
                          <Clock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                          <input
                            type="time"
                            required
                            value={eventFormData.eventTime}
                            onChange={(e) => handleInputChange('eventTime', e.target.value)}
                            className={`${inputFocusClass} pl-12`}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Nom de la salle / Lieu *</label>
                      <input
                        type="text"
                        required
                        value={eventFormData.venue}
                        onChange={(e) => handleInputChange('venue', e.target.value)}
                        placeholder="Ex: Le Zénith"
                        className={inputFocusClass}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Ville *</label>
                        <input
                          type="text"
                          required
                          value={eventFormData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder="Paris"
                          className={inputFocusClass}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Capacité totale *</label>
                        <input
                          type="number"
                          required
                          value={eventFormData.capacity}
                          onChange={(e) => handleInputChange('capacity', e.target.value)}
                          placeholder="5000"
                          className={inputFocusClass}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSaveEvent}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-4 text-base font-semibold text-white shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2 ${
                       isSaving
                        ? 'bg-festigo/70 cursor-not-allowed'
                        : 'bg-festigo hover:-translate-y-0.5 hover:bg-festigo-hover hover:shadow-xl shadow-festigo/15'
                    }`}
                  >
                    <Save className="h-5 w-5" />
                    {isSaving ? 'Création en cours...' : "Enregistrer l'événement"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
