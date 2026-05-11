import React, { useState, useEffect, useMemo } from 'react';
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
import { typeBilletService, TypeBilletType } from '../services/typeBilletService';
import { billetService } from '../services/billetService';
import { commandeService, StatutCommande } from '../services/commandeService';
import { parseEventStartMs } from '../services/userTicketsService';
import { FestigoLogo } from './festigo-logo';
import { OrganizerSettings } from './organizer-settings';
import { OrganizerCalendar } from './organizer-calendar';

type OrganizerView = 'dashboard' | 'my-events' | 'edit-event' | 'calendar' | 'settings';

/** Réponse plate de GET /api/billets (le typage `Billet` du service peut être trop strict). */
type ApiBilletRow = {
  commandeId?: number;
  typeBilletId?: number;
  commande?: { id?: number };
  typeBillet?: { id?: number };
};

function getBilletCommandeAndTypeIds(b: ApiBilletRow): { commandeId: number; typeBilletId: number } | null {
  const commandeIdRaw = b.commandeId ?? b.commande?.id;
  const typeBilletIdRaw = b.typeBilletId ?? b.typeBillet?.id;
  if (commandeIdRaw == null || typeBilletIdRaw == null) return null;
  const commandeId = Number(commandeIdRaw);
  const typeBilletId = Number(typeBilletIdRaw);
  if (!Number.isFinite(commandeId) || !Number.isFinite(typeBilletId)) return null;
  return { commandeId, typeBilletId };
}

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

type OrganizerDashboardProps = {
  onLogout: () => void;
};

export function OrganizerDashboard({ onLogout }: OrganizerDashboardProps) {
  const [view, setView] = useState<OrganizerView>('dashboard');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  /** Somme des prix des billets vendus (commandes validées) pour les événements de cet organisateur. */
  const [estimatedRevenue, setEstimatedRevenue] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const organizerName = currentUser?.nomOrganisation || currentUser?.nom || 'Organisateur';

  const [availableArtists, setAvailableArtists] = useState<Artiste[]>([]);

  // État pour savoir quel événement on est en train de modifier
  const [editingEventId, setEditingEventId] = useState<number | null>(null);

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
    GrandPublicPrice: '',
    GrandPublicQuantity: '',
    VVIPPrice: '',
    VVIPQuantity: '',
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

  useEffect(() => {
    if (events.length === 0) {
      setEstimatedRevenue(0);
      return;
    }
    const myEventIds = new Set(events.map((e) => e.id));
    let cancelled = false;
    (async () => {
      try {
        const [billets, types, commandes] = await Promise.all([
          billetService.getAllBillets(),
          typeBilletService.getAllTypeBillets(),
          commandeService.getAllCommandes(),
        ]);
        if (cancelled) return;

        const validatedCommandeIds = new Set(
          commandes.filter((c) => c.statut === StatutCommande.VALIDEE).map((c) => c.id)
        );

        const prixByTypeBilletId = new Map<number, { eventId: number; prix: number }>();
        for (const t of types) {
          if (t.id == null || t.eventId == null) continue;
          prixByTypeBilletId.set(t.id, { eventId: t.eventId, prix: t.prix });
        }

        let sum = 0;
        for (const raw of billets as ApiBilletRow[]) {
          const ids = getBilletCommandeAndTypeIds(raw);
          if (!ids) continue;
          if (!validatedCommandeIds.has(ids.commandeId)) continue;

          const meta = prixByTypeBilletId.get(ids.typeBilletId);
          if (!meta || !myEventIds.has(meta.eventId)) continue;

          sum += meta.prix;
        }

        setEstimatedRevenue(sum);
      } catch (err) {
        console.error('Erreur calcul du revenu estimé', err);
        if (!cancelled) setEstimatedRevenue(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [events]);

  const { upcomingEventCount, pastEventCount } = useMemo(() => {
    const now = Date.now();
    let upcoming = 0;
    let past = 0;
    for (const ev of events) {
      const startMs = parseEventStartMs(ev);
      if (!Number.isFinite(startMs)) continue;
      if (startMs >= now) upcoming += 1;
      else past += 1;
    }
    return { upcomingEventCount: upcoming, pastEventCount: past };
  }, [events]);

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
    if (field === 'role' && value === 'headliner') {
      const alreadyHeadliner = artists.find((a) => a.role === 'headliner' && a.id !== id);
      if (alreadyHeadliner) {
        setSaveMessage({
          text: "Un seul artiste principal est autorisé. Repassez d'abord l'artiste principal actuel en \"invité\" avant d'en désigner un nouveau.",
          type: 'error',
        });
        return;
      }
    }
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

  /** Aperçu photo artiste : data URL, URL absolue, ou chemin renvoyé par l’API (`/images/...`). */
  const getArtistFormImageSrc = (preview: string) => {
    const v = (preview || '').trim();
    if (!v) return null;
    if (v.startsWith('data:') || v.startsWith('http://') || v.startsWith('https://')) return v;
    if (v.startsWith('/images/')) return v;
    const fileName = v.split('/').pop()?.split('?')[0];
    if (fileName) return `/images/${encodeURIComponent(fileName)}`;
    return v.startsWith('/') ? v : null;
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

  const handleDeleteEvent = async (e: React.MouseEvent, eventId: number) => {
    e.stopPropagation();
    e.preventDefault();

    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.")) {
      try {
        await eventService.deleteEvent(eventId);
        setEvents(events.filter(ev => ev.id !== eventId));
        alert("Événement supprimé avec succès.");
      } catch (error) {
        console.error("Erreur lors de la suppression", error);
        alert("Impossible de supprimer cet événement. Il est probablement lié à d'autres données (comme des billets vendus).");
      }
    }
  };

  const handleEditEventClick = async (e: React.MouseEvent, evt: Event) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingEventId(evt.id);

    // Pré-remplir le formulaire avec les données de l'événement
    const dateObj = evt.date ? new Date(evt.date) : new Date();
    const dateString = dateObj.toISOString().split('T')[0];

    // Pour simplifier le parsing du lieu qui était formaté comme "Venue, Address, City"
    const lieuParts = evt.lieu ? evt.lieu.split(', ') : ['', '', ''];
    const venue = lieuParts[0] || '';
    const address = lieuParts[1] || '';
    const city = lieuParts[2] || '';

    setEventFormData({
      eventName: evt.nom || '',
      eventDate: dateString,
      eventTime: evt.heure ? evt.heure.substring(0, 5) : '', // "20:00:00" -> "20:00"
      venue: venue,
      address: address,
      city: city,
      capacity: evt.nbPlaces ? evt.nbPlaces.toString() : '',
      description: evt.description || '',
      category: evt.genreMusical || '',
      GrandPublicPrice: '', GrandPublicQuantity: '', VVIPPrice: '', VVIPQuantity: '', vipPrice: '', vipQuantity: '',
      eventImageName: '',
      eventImagePreview: evt.image || '',
      eventImageFile: null,
    });

    // Essayer de récupérer les artistes (Headliner + Guests)
    const newArtistsList = [];
    if (evt.artistePrincipalId) {
      const headliner = availableArtists.find(a => a.id === evt.artistePrincipalId);
      if (headliner) {
        newArtistsList.push({
          id: Date.now(), dbId: headliner.id || null, name: headliner.nomArtiste || headliner.nom || '',
          role: 'headliner', imageName: '', imagePreview: headliner.photoUrl || '', imageFile: null
        });
      }
    }

    if (evt.inviteIds && evt.inviteIds.length > 0) {
      evt.inviteIds.forEach((inviteId, idx) => {
        const guest = availableArtists.find(a => a.id === inviteId);
        if (guest) {
           newArtistsList.push({
             id: Date.now() + idx + 1, dbId: guest.id || null, name: guest.nomArtiste || guest.nom || '',
             role: 'supporting', imageName: '', imagePreview: guest.photoUrl || '', imageFile: null
           });
        }
      });
    }

    if (newArtistsList.length === 0) {
       newArtistsList.push({ id: 1, dbId: null, name: '', role: 'headliner', imageName: '', imagePreview: '', imageFile: null });
    }

    setArtists(newArtistsList);
    setSaveMessage(null);
    setView('edit-event');
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

    const headlinersAtSave = artists.filter((a) => a.role === 'headliner');
    if (headlinersAtSave.length > 1) {
      setSaveMessage({
        text: "Erreur : un seul artiste principal est autorisé par événement.",
        type: 'error',
      });
      return;
    }
    if (headlinersAtSave.length === 0) {
      setSaveMessage({
        text: "Erreur : vous devez désigner un artiste principal.",
        type: 'error',
      });
      return;
    }

    let ticketTiersToCreate: any[] = [];
    const isEditing = view === 'edit-event' && editingEventId !== null;

    if (!isEditing || (eventFormData.GrandPublicPrice || eventFormData.VVIPPrice || eventFormData.vipPrice)) {
        const ticketTierRows: Array<{
          label: string;
          type: TypeBilletType;
          priceStr: string;
          qtyStr: string;
        }> = [
          { label: 'GrandPublic', type: TypeBilletType.GrandPublic, priceStr: eventFormData.GrandPublicPrice, qtyStr: eventFormData.GrandPublicQuantity },
          { label: 'VVIP', type: TypeBilletType.VIP, priceStr: eventFormData.VVIPPrice, qtyStr: eventFormData.VVIPQuantity },
          { label: 'VIP', type: TypeBilletType.VVIP, priceStr: eventFormData.vipPrice, qtyStr: eventFormData.vipQuantity },
        ];

        for (const row of ticketTierRows) {
          const hasP = row.priceStr.trim() !== '';
          const hasQ = row.qtyStr.trim() !== '';
          if (hasP !== hasQ) {
            setSaveMessage({
              text: `Renseignez le prix et la quantité pour les billets ${row.label}, ou laissez les deux champs vides.`,
              type: 'error',
            });
            return;
          }
        }

        ticketTiersToCreate = ticketTierRows
          .filter((row) => row.priceStr.trim() !== '' && row.qtyStr.trim() !== '')
          .map((row) => ({
            type: row.type,
            prix: parseFloat(row.priceStr.replace(',', '.')),
            stock: parseInt(row.qtyStr, 10),
          }));

        if (!isEditing && ticketTiersToCreate.length === 0) {
          setSaveMessage({
            text: 'Ajoutez au moins une catégorie de billet (prix et quantité) : GrandPublic, VVIP ou VIP.',
            type: 'error',
          });
          return;
        }

        const invalidTier = ticketTiersToCreate.find(
          (t) =>
            !Number.isFinite(t.prix) || t.prix <= 0 ||
            !Number.isFinite(t.stock) || !Number.isInteger(t.stock) || t.stock <= 0
        );
        if (invalidTier) {
          setSaveMessage({
            text: 'Chaque tarif renseigné doit avoir un prix et une quantité strictement supérieurs à 0 (quantités en nombres entiers).',
            type: 'error',
          });
          return;
        }
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
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
            await artisteService.uploadArtisteImage(artistePrincipalId, headlinerInput.imageFile).catch(console.error);
         }
      } else {
         const newArtist = await artisteService.createArtiste({
            nomArtiste: headlinerInput.name,
            nom: headlinerInput.name,
            photoUrl: ''
         });
         artistePrincipalId = newArtist.id!;
         if (headlinerInput.imageFile) {
            await artisteService.uploadArtisteImage(artistePrincipalId, headlinerInput.imageFile).catch(console.error);
         }
         setAvailableArtists([...availableArtists, newArtist]);
      }

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
              await artisteService.uploadArtisteImage(fGuest.id, guest.imageFile).catch(console.error);
            }
         } else {
            const nGuest = await artisteService.createArtiste({
               nomArtiste: guest.name,
               nom: guest.name,
               photoUrl: ''
            });
            inviteIds.push(nGuest.id!);
            if (guest.imageFile) {
              await artisteService.uploadArtisteImage(nGuest.id!, guest.imageFile).catch(console.error);
            }
            setAvailableArtists(prev => [...prev, nGuest]);
         }
      }

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
         image: isEditing ? (eventFormData.eventImageFile ? '' : eventFormData.eventImagePreview) : ''
      };

      if (isEditing) {
         await eventService.updateEvent(editingEventId!, newEventData);
         if (eventFormData.eventImageFile && eventService.uploadEventImage) {
            await eventService.uploadEventImage(editingEventId!, eventFormData.eventImageFile).catch(console.error);
         }
         for (const tier of ticketTiersToCreate) {
             await typeBilletService.createTypeBillet({
               eventId: editingEventId!,
               type: tier.type,
               prix: tier.prix,
               stock: tier.stock,
             }).catch(console.error);
         }
         setSaveMessage({text: "L'événement a été mis à jour avec succès !", type: 'success'});

      } else {
         const createdEvent = await eventService.createEvent(newEventData);
         if (!createdEvent.id) {
           throw new Error("Réponse serveur invalide : l'événement créé n'a pas d'identifiant.");
         }

         if (eventFormData.eventImageFile && eventService.uploadEventImage) {
           await eventService.uploadEventImage(createdEvent.id, eventFormData.eventImageFile).catch(console.error);
         }

         for (const tier of ticketTiersToCreate) {
           await typeBilletService.createTypeBillet({
             eventId: createdEvent.id,
             type: tier.type,
             prix: tier.prix,
             stock: tier.stock,
           });
         }
         setSaveMessage({text: "L'événement et les tarifs ont été enregistrés avec succès !", type: 'success'});
      }

      setEventFormData({
        eventName: '', eventDate: '', eventTime: '', venue: '', address: '', city: '',
        capacity: '', description: '', category: '',
        GrandPublicPrice: '', GrandPublicQuantity: '', VVIPPrice: '', VVIPQuantity: '',
        vipPrice: '', vipQuantity: '',
        eventImageName: '', eventImagePreview: '', eventImageFile: null,
      });
      setArtists([{ id: 1, dbId: null, name: '', role: 'headliner', imageName: '', imagePreview: '', imageFile: null }]);
      setEditingEventId(null);

      fetchMyEvents();
      setTimeout(() => setView('dashboard'), 1500);

    } catch (err: any) {
      console.error("Détail de l'erreur lors de la sauvegarde:", err);
      setSaveMessage({
        text: `Erreur lors de la ${isEditing ? 'mise à jour' : 'création'}: ${err.message || 'Problème serveur'}`,
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

  const isFormView = view === 'my-events' || view === 'edit-event';

  return (
    <div className="flex h-screen bg-slate-50 font-sans antialiased">
      <aside className="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-5">
          <FestigoLogo className="h-9 max-w-[52px]" /> 
          <p className="mt-2 text-xs font-medium text-gray-500">Gestion des événements</p>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          <button type="button" onClick={() => { setView('dashboard'); setEditingEventId(null); }} className={navBtn(view === 'dashboard')}>
            <LayoutDashboard className="h-5 w-5 shrink-0 opacity-80" />
            <span>Dashboard</span>
          </button>
          <button type="button" onClick={() => {
              setEventFormData({
                  eventName: '', eventDate: '', eventTime: '', venue: '', address: '', city: '',
                  capacity: '', description: '', category: '', GrandPublicPrice: '', GrandPublicQuantity: '',
                  VVIPPrice: '', VVIPQuantity: '', vipPrice: '', vipQuantity: '', eventImageName: '', eventImagePreview: '', eventImageFile: null,
              });
              setArtists([{ id: 1, dbId: null, name: '', role: 'headliner', imageName: '', imagePreview: '', imageFile: null }]);
              setEditingEventId(null);
              setView('my-events');
          }} className={navBtn(view === 'my-events')}>
            <Ticket className="h-5 w-5 shrink-0 opacity-80" />
            <span>Créer un événement</span>
          </button>
          <button
            type="button"
            onClick={() => { setView('calendar'); setEditingEventId(null); }}
            className={navBtn(view === 'calendar')}
          >
            <Calendar className="h-5 w-5 shrink-0 opacity-80" />
            <span>Calendrier</span>
          </button>
          <button type="button" onClick={() => setView('settings')} className={navBtn(view === 'settings')}>
            <Settings className="h-5 w-5 shrink-0 opacity-80" />
            <span>Paramètres</span>
          </button>
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50" onClick={onLogout}>
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
              {view === 'dashboard'
                ? 'Vue d’ensemble'
                : view === 'edit-event'
                  ? 'Modification'
                  : view === 'calendar'
                    ? 'Planning'
                    : view === 'settings'
                      ? 'Compte'
                      : 'Événements'}
            </p>
            <h2 className="text-lg font-semibold text-gray-900">
              {view === 'dashboard'
                ? 'Tableau de bord'
                : view === 'edit-event'
                  ? 'Modifier l\'événement'
                  : view === 'calendar'
                    ? 'Calendrier'
                    : view === 'settings'
                      ? 'Paramètres'
                      : 'Créer un événement'}
            </h2>
          </div>
           
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-festigo text-xs font-semibold text-white uppercase">
               {organizerName.substring(0, 2)}
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

              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-festigo/10">
                      <DollarSign className="h-6 w-6 text-festigo" />
                    </div>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Revenue Estimé</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                    {estimatedRevenue === null
                      ? '— €'
                      : `${estimatedRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-festigo/10">
                      <Calendar className="h-6 w-6 text-festigo" />
                    </div>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Évènements à venir</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{upcomingEventCount}</p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-festigo/10">
                      <X className="h-6 w-6 text-festigo" />
                    </div>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Évènements terminés</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{pastEventCount}</p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-festigo/10">
                      <Users className="h-6 w-6 text-festigo" />
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
                              onClick={(e) => handleEditEventClick(e, event)}
                              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white hover:text-blue-600 hover:shadow-sm"
                              title="Modifier l'événement"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteEvent(e, event.id)}
                              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white hover:text-red-600 hover:shadow-sm"
                              title="Supprimer l'événement"
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

          {isFormView && (
            <div className="p-6 md:p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                  {view === 'edit-event' ? "Modifier l'événement" : "Créer un nouvel événement"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {view === 'edit-event' ? "Mettez à jour les informations de votre concert" : "Planifiez et publiez votre prochain concert"}
                </p>
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
                            {eventFormData.eventImageName || eventFormData.eventImagePreview ? "Changer l'image" : "Uploader une image"}
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
                                  <option
                                    value="headliner"
                                    disabled={
                                      artist.role !== 'headliner' &&
                                      artists.some((a) => a.role === 'headliner' && a.id !== artist.id)
                                    }
                                  >
                                    Artiste principal
                                    {artist.role !== 'headliner' &&
                                    artists.some((a) => a.role === 'headliner' && a.id !== artist.id)
                                      ? ' (déjà défini)'
                                      : ''}
                                  </option>
                                  <option value="supporting">Artiste invité</option>
                                </select>
                                <ChevronDown
                                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                                  aria-hidden
                                />
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

                        <div className="mt-4 border-t border-gray-200/80 pt-4">
                          <label className="mb-2 block text-xs font-medium text-gray-500">
                            Photo de l&apos;artiste <span className="font-normal text-gray-400">(optionnel)</span>
                          </label>
                          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
                            <input
                              id={`artist-photo-${artist.id}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleArtistImageUpload(artist.id, e.target.files?.[0] ?? null)}
                            />
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-festigo/20 bg-gradient-to-br from-festigo/10 to-violet-100">
                              {getArtistFormImageSrc(artist.imagePreview) ? (
                                <img
                                  src={getArtistFormImageSrc(artist.imagePreview)!}
                                  alt=""
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <ImageIcon className="h-6 w-6 text-festigo/60" aria-hidden />
                              )}
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <label
                                htmlFor={`artist-photo-${artist.id}`}
                                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-festigo px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-festigo-hover"
                              >
                                <ImageIcon className="h-3.5 w-3.5" aria-hidden />
                                {artist.imageName || artist.imageFile || getArtistFormImageSrc(artist.imagePreview)
                                  ? 'Changer la photo'
                                  : 'Ajouter une photo'}
                              </label>
                              <p className="truncate text-xs text-gray-500">
                                {artist.imageName ||
                                  (getArtistFormImageSrc(artist.imagePreview) && !artist.imageFile
                                    ? 'Photo enregistrée'
                                    : 'Carré ou portrait, envoyée à l’enregistrement de l’événement')}
                              </p>
                            </div>
                          </div>
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

                <div className={`${sectionCardClass} mb-6`}>
                  <div className="mb-8 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-festigo/10">
                      <Ticket className="h-5 w-5 text-festigo" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Tarifs</h3>
                      <p className="text-sm text-gray-500">
                        {view === 'edit-event' ? "Ajouter de nouveaux tarifs (les tarifs existants ne sont pas modifiés ici)" : "Prix et quantites par categorie"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <Tag className="h-5 w-5 text-gray-600" />
                        <h4 className="font-semibold text-gray-900">Billets GrandPublic</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-xs font-medium text-gray-500">Prix (EUR)</label>
                          <input
                            type="number"
                            value={eventFormData.GrandPublicPrice}
                            onChange={(e) => handleInputChange('GrandPublicPrice', e.target.value)}
                            placeholder="50"
                            className={inputFocusClass}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-medium text-gray-500">Quantite</label>
                          <input
                            type="number"
                            value={eventFormData.GrandPublicQuantity}
                            onChange={(e) => handleInputChange('GrandPublicQuantity', e.target.value)}
                            placeholder="3000"
                            className={inputFocusClass}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-festigo/25 bg-festigo/10 p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <Tag className="h-5 w-5 text-festigo" />
                        <h4 className="font-semibold text-gray-900">Billets VVIP</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-xs font-medium text-gray-500">Prix (EUR)</label>
                          <input
                            type="number"
                            value={eventFormData.VVIPPrice}
                            onChange={(e) => handleInputChange('VVIPPrice', e.target.value)}
                            placeholder="100"
                            className={inputFocusClass}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-medium text-gray-500">Quantite</label>
                          <input
                            type="number"
                            value={eventFormData.VVIPQuantity}
                            onChange={(e) => handleInputChange('VVIPQuantity', e.target.value)}
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
                          <label className="mb-2 block text-xs font-medium text-gray-500">Prix (EUR)</label>
                          <input
                            type="number"
                            value={eventFormData.vipPrice}
                            onChange={(e) => handleInputChange('vipPrice', e.target.value)}
                            placeholder="250"
                            className={inputFocusClass}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-medium text-gray-500">Quantite</label>
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
                    disabled={isSaving}
                    onClick={handleSaveEvent}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-4 text-base font-semibold text-white shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2 ${
                       isSaving
                        ? 'bg-festigo/70 cursor-not-allowed'
                        : 'bg-festigo hover:-translate-y-0.5 hover:bg-festigo-hover hover:shadow-xl shadow-festigo/15'
                    }`}
                  >
                    <Save className="h-5 w-5" />
                    {isSaving ? 'Sauvegarde en cours...' : (view === 'edit-event' ? "Mettre à jour l'événement" : "Enregistrer & publier l'événement")}
                  </button>
                  {view === 'edit-event' && (
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => { setView('dashboard'); setEditingEventId(null); }}
                      className="rounded-xl border border-gray-200 bg-white py-4 px-6 text-base font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {view === 'calendar' && (
            <OrganizerCalendar events={events} isLoading={isLoadingEvents} />
          )}

          {view === 'settings' && currentUser && (
            <OrganizerSettings
              currentUser={currentUser}
              onUserUpdated={setCurrentUser}
            />
          )}
        </div>
      </main>
    </div>
  );
}
