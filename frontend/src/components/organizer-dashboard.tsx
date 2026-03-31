import React, { useState } from 'react';
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

type OrganizerView = 'dashboard' | 'my-events';

const salesData = [
  { month: 'Jan', revenue: 12400 },
  { month: 'Feb', revenue: 19800 },
  { month: 'Mar', revenue: 15600 },
  { month: 'Apr', revenue: 28900 },
  { month: 'May', revenue: 34200 },
  { month: 'Jun', revenue: 42100 },
];

const upcomingEvents = [
  {
    id: 1,
    name: 'Summer Jazz Festival',
    date: 'July 15, 2026',
    venue: 'Blue Note Arena',
    ticketsSold: 1247,
    capacity: 2500,
    revenue: '€62,350',
    status: 'active',
  },
  {
    id: 2,
    name: 'Electric Nights',
    date: 'July 22, 2026',
    venue: 'Metro Electronic Hall',
    ticketsSold: 892,
    capacity: 1200,
    revenue: '€44,600',
    status: 'active',
  },
  {
    id: 3,
    name: 'Rock the Valley',
    date: 'August 5, 2026',
    venue: 'Valley Stadium',
    ticketsSold: 3421,
    capacity: 5000,
    revenue: '€171,050',
    status: 'sold-out',
  },
  {
    id: 4,
    name: 'Indie Collective Tour',
    date: 'August 18, 2026',
    venue: 'The Underground',
    ticketsSold: 456,
    capacity: 800,
    revenue: '€18,240',
    status: 'draft',
  },
];

const inputFocusClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm transition-colors focus:border-festigo focus:outline-none focus:ring-2 focus:ring-festigo/20';

/** Même base que les champs texte + reset navigateur pour aligner hauteur, bordure et flèche */
const selectFieldClass = `${inputFocusClass} cursor-pointer appearance-none pr-10`;

const sectionCardClass =
  'rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8';

export function OrganizerDashboard() {
  const [view, setView] = useState<OrganizerView>('my-events');
  const [artists, setArtists] = useState<
    Array<{ id: number; name: string; role: string; imageName: string; imagePreview: string }>
  >([
    { id: 1, name: '', role: 'headliner', imageName: '', imagePreview: '' },
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
  });

  const handleInputChange = (field: string, value: string) => {
    setEventFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addArtist = () => {
    setArtists([...artists, { id: Date.now(), name: '', role: 'supporting', imageName: '', imagePreview: '' }]);
  };

  const removeArtist = (id: number) => {
    if (artists.length > 1) {
      setArtists(artists.filter((artist) => artist.id !== id));
    }
  };

  const updateArtist = (id: number, field: 'name' | 'role' | 'imageName' | 'imagePreview', value: string) => {
    setArtists(artists.map((artist) => (artist.id === id ? { ...artist, [field]: value } : artist)));
  };

  const handleArtistImageUpload = (id: number, file: File | null) => {
    if (!file) {
      setArtists(artists.map((artist) => (artist.id === id ? { ...artist, imageName: '', imagePreview: '' } : artist)));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setArtists(
        artists.map((artist) =>
          artist.id === id ? { ...artist, imageName: file.name, imagePreview: String(reader.result || '') } : artist
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEvent = () => {
    console.log('Saving event:', eventFormData, 'Artists:', artists);
    // Handle save logic
  };

  const navBtn = (active: boolean) =>
    `flex w-full items-center gap-3 rounded-lg py-2.5 pl-3 pr-4 text-left text-sm transition-colors ${
      active
        ? 'border-l-4 border-festigo bg-festigo/10 font-medium text-festigo'
        : 'border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  return (
    <div className="flex h-screen bg-slate-50 font-sans antialiased">
      <aside className="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-5">
          <h1 className="text-lg font-bold tracking-tight text-gray-900">
            FestiGo<span className="text-festigo">.</span>
          </h1>
          <p className="mt-0.5 text-xs font-medium text-gray-500">Organizer</p>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          <button type="button" onClick={() => setView('dashboard')} className={navBtn(view === 'dashboard')}>
            <LayoutDashboard className="h-5 w-5 shrink-0 opacity-80" />
            <span>Dashboard</span>
          </button>
          <button type="button" onClick={() => setView('my-events')} className={navBtn(view === 'my-events')}>
            <Ticket className="h-5 w-5 shrink-0 opacity-80" />
            <span>Mes événements</span>
          </button>
          <a href="#" className={navBtn(false)}>
            <Calendar className="h-5 w-5 shrink-0 opacity-80" />
            <span>Calendrier</span>
          </a>
          <a href="#" className={navBtn(false)}>
            <Settings className="h-5 w-5 shrink-0 opacity-80" />
            <span>Paramètres</span>
          </a>
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-festigo text-xs font-semibold text-white">
              SM
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">Sarah Mitchell</p>
              <p className="truncate text-xs text-gray-500">Organisateur</p>
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
            <button
              type="button"
              className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-festigo ring-2 ring-white" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-festigo text-xs font-semibold text-white">
              SM
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {view === 'dashboard' && (
            <div className="p-6 md:p-8">
              <div className="mb-8">
                <p className="text-sm text-gray-500">
                  Bienvenue, <span className="font-medium text-gray-700">NomOrganisation</span>
                </p>
              </div>

              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-festigo/10">
                      <DollarSign className="h-6 w-6 text-festigo" />
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                      0%
                    </span>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Revenue</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">0€</p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-festigo/10">
                      <Ticket className="h-6 w-6 text-festigo" />
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                      0%
                    </span>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tickets vendus</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">0</p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-festigo/10">
                      <Calendar className="h-6 w-6 text-festigo" />
                    </div>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                      Actif
                    </span>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Événements actifs</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">12</p>
                </div>
              </div>

              <div className={`${sectionCardClass} mb-8`}>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Performance des ventes</h3>
                    <p className="text-sm text-gray-500">Tendances de revenus sur les 6 derniers mois</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span>6 derniers mois</span>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="month"
                      stroke="#94a3b8"
                      style={{ fontSize: '12px', fontFamily: 'Inter, system-ui, sans-serif' }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      style={{ fontSize: '12px', fontFamily: 'Inter, system-ui, sans-serif' }}
                      tickFormatter={(value) => `€${value / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        fontFamily: 'Inter, system-ui, sans-serif',
                        boxShadow: '0 10px 40px -10px rgb(15 23 42 / 0.15)',
                      }}
                      formatter={(value) => [`€${Number(value).toLocaleString()}`, 'Revenue']}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#125484"
                      strokeWidth={2.5}
                      dot={{ fill: '#125484', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-5">
                  <h3 className="text-lg font-semibold text-gray-900">Événements à venir</h3>
                </div>
                <div className="overflow-x-auto">
                  <div className="min-w-[880px]">
                    <div className="grid grid-cols-12 gap-4 border-b border-gray-200 bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      <div className="col-span-2">Événement</div>
                      <div className="col-span-2">Date</div>
                      <div className="col-span-2">Lieu</div>
                      <div className="col-span-2">Tickets</div>
                      <div className="col-span-2">Revenus</div>
                      <div className="col-span-1">Statut</div>
                      <div className="col-span-1 text-right">Actions</div>
                    </div>
                    {upcomingEvents.map((event) => {
                      const getStatusStyles = (status: string) => {
                        switch (status) {
                          case 'active':
                            return 'bg-emerald-100 text-emerald-800';
                          case 'sold-out':
                            return 'bg-red-100 text-red-800';
                          case 'draft':
                            return 'bg-gray-100 text-gray-800';
                          default:
                            return 'bg-gray-100 text-gray-600';
                        }
                      };

                      return (
                        <div
                          key={event.id}
                          className="grid grid-cols-12 items-center gap-4 border-b border-gray-100 px-6 py-4 transition-colors last:border-b-0 hover:bg-gray-50"
                        >
                          <div className="col-span-2">
                            <p className="font-semibold text-gray-900">{event.name}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-500">{event.date}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-700">{event.venue}</p>
                          </div>
                          <div className="col-span-2">
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                                <div
                                  className="h-full rounded-full bg-festigo"
                                  style={{ width: `${(event.ticketsSold / event.capacity) * 100}%` }}
                                />
                              </div>
                              <span className="whitespace-nowrap text-xs text-gray-500">
                                {event.ticketsSold}/{event.capacity}
                              </span>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <p className="font-semibold text-gray-900">{event.revenue}</p>
                          </div>
                          <div className="col-span-1">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusStyles(event.status)}`}
                            >
                              {event.status === 'sold-out'
                                ? 'Sold Out'
                                : event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                            </span>
                          </div>
                          <div className="col-span-1 flex justify-end gap-0.5">
                            <button
                              type="button"
                              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white hover:text-gray-800 hover:shadow-sm"
                              aria-label="Modifier"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white hover:text-gray-800 hover:shadow-sm"
                              aria-label="Voir"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white hover:text-red-600 hover:shadow-sm"
                              aria-label="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
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
                        value={eventFormData.eventName}
                        onChange={(e) => handleInputChange('eventName', e.target.value)}
                        placeholder="Enter event name"
                        className={inputFocusClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Genre musical *</label>
                      <div className="relative">
                        <select
                          value={eventFormData.category}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          className={selectFieldClass}
                        >
                          <option value="">Sélectionner un genre</option>
                          <option value="Rock">Rock</option>
                          <option value="Jazz">Jazz</option>
                          <option value="Electronic">Electronic</option>
                          <option value="Hip Hop">Hip Hop</option>
                          <option value="Indie">Indie</option>
                          <option value="Classical">Classical</option>
                          <option value="Pop">Pop</option>
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
                        placeholder="Describe your event, lineup, and special features..."
                        rows={4}
                        className={`${inputFocusClass} resize-none`}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Bannière de l&apos;événement</label>
                      <div className="cursor-pointer rounded-xl border-2 border-dashed border-gray-200 p-8 transition-colors hover:border-festigo/30 hover:bg-gray-50/50">
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-gray-900">Télécharger la bannière</p>
                            <p className="text-sm text-gray-500">Taille recommandée : 1920×1080px</p>
                          </div>
                          <button
                            type="button"
                            className="rounded-lg border border-gray-200 bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                          >
                            Choisir un fichier
                          </button>
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
                        <p className="text-sm text-gray-500">Ajouter des artistes et performers</p>
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
                                value={artist.name}
                                onChange={(e) => updateArtist(artist.id, 'name', e.target.value)}
                                placeholder="e.g., The Rolling Stones"
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
                            <span>Artiste principal</span>
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
                            value={eventFormData.eventTime}
                            onChange={(e) => handleInputChange('eventTime', e.target.value)}
                            className={`${inputFocusClass} pl-12`}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Nom du lieu *</label>
                      <input
                        type="text"
                        value={eventFormData.venue}
                        onChange={(e) => handleInputChange('venue', e.target.value)}
                        placeholder="e.g., Madison Square Garden"
                        className={inputFocusClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Adresse *</label>
                      <input
                        type="text"
                        value={eventFormData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="123 Main Street"
                        className={inputFocusClass}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Ville *</label>
                        <input
                          type="text"
                          value={eventFormData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder="New York, NY"
                          className={inputFocusClass}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Capacité totale *</label>
                        <input
                          type="number"
                          value={eventFormData.capacity}
                          onChange={(e) => handleInputChange('capacity', e.target.value)}
                          placeholder="5000"
                          className={inputFocusClass}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`${sectionCardClass} mb-6`}>
                  <div className="mb-8 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-festigo/10">
                      <Ticket className="h-5 w-5 text-festigo" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Tarifs</h3>
                      <p className="text-sm text-gray-500">Prix et quantités par catégorie</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <Tag className="h-5 w-5 text-gray-600" />
                        <h4 className="font-semibold text-gray-900">Billets standard</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-xs font-medium text-gray-500">Prix (€)</label>
                          <input
                            type="number"
                            value={eventFormData.standardPrice}
                            onChange={(e) => handleInputChange('standardPrice', e.target.value)}
                            placeholder="50"
                            className={inputFocusClass}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-medium text-gray-500">Quantité</label>
                          <input
                            type="number"
                            value={eventFormData.standardQuantity}
                            onChange={(e) => handleInputChange('standardQuantity', e.target.value)}
                            placeholder="3000"
                            className={inputFocusClass}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-festigo/25 bg-festigo/10 p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <Tag className="h-5 w-5 text-festigo" />
                        <h4 className="font-semibold text-gray-900">Billets premium</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-xs font-medium text-gray-500">Prix (€)</label>
                          <input
                            type="number"
                            value={eventFormData.premiumPrice}
                            onChange={(e) => handleInputChange('premiumPrice', e.target.value)}
                            placeholder="100"
                            className={inputFocusClass}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-medium text-gray-500">Quantité</label>
                          <input
                            type="number"
                            value={eventFormData.premiumQuantity}
                            onChange={(e) => handleInputChange('premiumQuantity', e.target.value)}
                            placeholder="1500"
                            className={inputFocusClass}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-festigo/25 bg-festigo/10 p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <Tag className="h-5 w-5 text-festigo" />
                        <h4 className="font-semibold text-gray-900">Billets VIP</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-xs font-medium text-gray-500">Prix (€)</label>
                          <input
                            type="number"
                            value={eventFormData.vipPrice}
                            onChange={(e) => handleInputChange('vipPrice', e.target.value)}
                            placeholder="250"
                            className={inputFocusClass}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-medium text-gray-500">Quantité</label>
                          <input
                            type="number"
                            value={eventFormData.vipQuantity}
                            onChange={(e) => handleInputChange('vipQuantity', e.target.value)}
                            placeholder="500"
                            className={inputFocusClass}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleSaveEvent}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-festigo py-4 text-base font-semibold text-white shadow-lg shadow-festigo/15 transition-all hover:-translate-y-0.5 hover:bg-festigo-hover hover:shadow-xl"
                  >
                    <Save className="h-5 w-5" />
                    Enregistrer & publier l&apos;événement
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
