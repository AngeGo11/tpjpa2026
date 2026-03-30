import { useState } from 'react';
import { LayoutDashboard, Settings, Shield, Check, X, Calendar, MapPin, User, Clock, Search, Filter } from 'lucide-react';

type EventStatus = 'pending' | 'published' | 'past';

interface Event {
  id: number;
  title: string;
  organizer: string;
  organizerEmail: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  category: string;
  expectedAttendees: number;
  status: EventStatus;
  submittedDate: string;
}

const mockEvents: Event[] = [
  {
    id: 1,
    title: 'Summer Jazz Festival',
    organizer: 'Sarah Mitchell',
    organizerEmail: 'sarah@jazzevents.com',
    date: 'July 15, 2026',
    time: '8:00 PM',
    venue: 'Blue Note Arena',
    location: 'Chicago, IL',
    category: 'Jazz',
    expectedAttendees: 2500,
    status: 'pending',
    submittedDate: 'Feb 1, 2026',
  },
  {
    id: 2,
    title: 'Electric Nights',
    organizer: 'Michael Roberts',
    organizerEmail: 'mike@electroevents.com',
    date: 'July 22, 2026',
    time: '10:00 PM',
    venue: 'Metro Electronic Hall',
    location: 'Brooklyn, NY',
    category: 'Electro',
    expectedAttendees: 1200,
    status: 'pending',
    submittedDate: 'Feb 2, 2026',
  },
  {
    id: 3,
    title: 'Rock the Valley',
    organizer: 'David Chen',
    organizerEmail: 'david@rockvalley.com',
    date: 'August 5, 2026',
    time: '7:00 PM',
    venue: 'Valley Stadium',
    location: 'Austin, TX',
    category: 'Rock',
    expectedAttendees: 5000,
    status: 'published',
    submittedDate: 'Jan 28, 2026',
  },
  {
    id: 4,
    title: 'Indie Collective Tour',
    organizer: 'Emma Thompson',
    organizerEmail: 'emma@indiecollective.com',
    date: 'August 18, 2026',
    time: '9:00 PM',
    venue: 'The Underground',
    location: 'Portland, OR',
    category: 'Indie',
    expectedAttendees: 800,
    status: 'published',
    submittedDate: 'Jan 25, 2026',
  },
  {
    id: 5,
    title: 'Classical Night',
    organizer: 'James Wilson',
    organizerEmail: 'james@classicalevents.com',
    date: 'January 15, 2026',
    time: '7:30 PM',
    venue: 'Symphony Hall',
    location: 'Boston, MA',
    category: 'Classical',
    expectedAttendees: 1800,
    status: 'past',
    submittedDate: 'Dec 10, 2025',
  },
];

interface AdminEventValidationProps {
  onNavigateToSettings?: () => void;
}

export function AdminEventValidation({ onNavigateToSettings }: AdminEventValidationProps) {
  const [activeTab, setActiveTab] = useState<EventStatus>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = mockEvents.filter(event => 
    event.status === activeTab &&
    (event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     event.organizer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusBadgeStyles = (status: EventStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'published':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'past':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusLabel = (status: EventStatus) => {
    switch (status) {
      case 'pending':
        return 'Pending Validation';
      case 'published':
        return 'Published';
      case 'past':
        return 'Completed';
      default:
        return status;
    }
  };

  const handleApprove = (eventId: number) => {
    console.log('Approved event:', eventId);
    // Handle approval logic
  };

  const handleReject = (eventId: number) => {
    console.log('Rejected event:', eventId);
    // Handle rejection logic
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">FestiGo<span className="text-accent">.</span></h1>
          <p className="text-xs text-muted-foreground font-light mt-1">Panneau d'administration</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-accent text-accent-foreground transition-colors">
            <Shield className="w-5 h-5" />
            <span className="font-light"> Modération des évènements </span>
          </a>
          <button 
            onClick={onNavigateToSettings}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="font-light">Paramètres de la plateforme</span>
          </button>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-light">Analyses</span>
          </a>
        </nav>
        
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-sm">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">Administrateur</p>
              <p className="text-xs text-muted-foreground truncate">Administrateur</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-12">
          {/* Header */}
          <div className="mb-12">
            <h2 className="text-3xl mb-2">Modération des évènements</h2>
            <p className="text-muted-foreground font-light"> Gérer les soumissions des organisateurs </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-border mb-8">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('pending')}
                className={`pb-4 px-2 font-light transition-colors relative €{
                  activeTab === 'pending'
                    ? 'text-accent'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                En attente de validation
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                  {mockEvents.filter(e => e.status === 'pending').length}
                </span>
                {activeTab === 'pending' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('published')}
                className={`pb-4 px-2 font-light transition-colors relative €{
                  activeTab === 'published'
                    ? 'text-accent'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Évènements à venir
                {activeTab === 'published' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`pb-4 px-2 font-light transition-colors relative €{
                  activeTab === 'past'
                    ? 'text-accent'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Évènements passés
                {activeTab === 'past' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search events or organizers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all font-light"
              />
            </div>
            <button className="px-5 py-3 border border-border rounded-xl hover:bg-muted transition-colors flex items-center gap-2 font-light">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>

          {/* Event List */}
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground font-light">Aucun évènement trouvé</p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white border border-border rounded-2xl p-8 hover:shadow-lg hover:shadow-accent/5 transition-all"
                >
                  <div className="flex items-start justify-between gap-6">
                    {/* Event Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl">{event.title}</h3>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-light border €{getStatusBadgeStyles(event.status)}`}>
                              {getStatusLabel(event.status)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground font-light">
                            Submitted on {event.submittedDate}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground font-light">Organisateur</p>
                              <p className="text-sm font-medium">{event.organizer}</p>
                              <p className="text-xs text-muted-foreground font-light">{event.organizerEmail}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground font-light">Date & Heure</p>
                              <p className="text-sm font-medium">{event.date} • {event.time}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground font-light">Venue</p>
                              <p className="text-sm font-medium">{event.venue}</p>
                              <p className="text-xs text-muted-foreground font-light">{event.location}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground font-light">Nombre d'attendees attendus</p>
                              <p className="text-sm font-medium">{event.expectedAttendees.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {event.status === 'pending' && (
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => handleApprove(event.id)}
                          className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg shadow-green-600/20"
                        >
                          <Check className="w-5 h-5" />
                          <span className="font-light">Approve</span>
                        </button>
                        <button
                          onClick={() => handleReject(event.id)}
                          className="px-6 py-3 border border-border rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors flex items-center gap-2"
                        >
                          <X className="w-5 h-5" />
                          <span className="font-light">Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}