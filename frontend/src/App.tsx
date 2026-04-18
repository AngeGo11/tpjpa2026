import React, { useEffect, useState } from 'react';
import { OrganizerDashboard } from './components/organizer-dashboard';
import { UserDiscovery } from './components/user-discovery';
import { EventDetails } from './components/event-details';
import { TicketModal } from './components/ticket-modal';
import { CommandeRecap } from './components/commande-recap';
import { LoginFestive } from './components/login-festive';
import { SignupFestive } from './components/signup-festive';
import { AdminSettings } from './components/admin-settings';
import {
  UserDashboard,
  getUserAccountMenuBadgeCounts,
  fanAppSectionTitle,
  type FanAppSection,
} from './components/user-dashboard';
import { UserAppNavbar } from './components/user-app-navbar';
import { authService } from './services/authService';
import { countUserUpcomingTickets } from './services/userTicketsService';

type View = 'dashboard' | 'event-details' | 'login' | 'signup' | 'admin-settings' | 'fan';

const accountBadgeCounts = getUserAccountMenuBadgeCounts();

export default function App() {
  const [currentView, setCurrentView] = useState<View>('fan');
  const [fanSection, setFanSection] = useState<FanAppSection>('discovery');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [recapCommandeId, setRecapCommandeId] = useState<number | null>(null);
  const [upcomingTicketCount, setUpcomingTicketCount] = useState(0);

  useEffect(() => {
    if (currentView !== 'fan') {
      setUpcomingTicketCount(0);
      return;
    }
    const u = authService.getCurrentUser();
    if (!u) {
      setUpcomingTicketCount(0);
      return;
    }
    countUserUpcomingTickets(u.id)
      .then(setUpcomingTicketCount)
      .catch(() => setUpcomingTicketCount(0));
  }, [currentView, fanSection, recapCommandeId]);

  const handleEventSelect = (eventId: number) => {
    setSelectedEventId(eventId);
    setCurrentView('event-details');
  };

  const handleBookTickets = () => {
    setIsModalOpen(true);
  };

  const handleBackToEvents = () => {
    setSelectedEventId(null);
    setCurrentView('fan');
    setFanSection('discovery');
  };

  return (
    <div className="min-h-screen bg-background">
      {currentView === 'login' && (
        <LoginFestive
          onNavigateToSignup={() => setCurrentView('signup')}
          onLoginAsUser={() => {
            setCurrentView('fan');
            setFanSection('discovery');
          }}
          onLoginAsOrganizer={() => setCurrentView('dashboard')}
        />
      )}
      {currentView === 'signup' && (
        <SignupFestive
          onNavigateToLogin={() => setCurrentView('login')}
          onLoginAsUser={() => {
            setCurrentView('fan');
            setFanSection('discovery');
          }}
          onLoginAsOrganizer={() => setCurrentView('dashboard')}
        />
      )}
      {currentView === 'dashboard' && (
        <OrganizerDashboard
          onLogout={() => {
            authService.logout();
            setCurrentView('login');
          }}
        />
      )}
      {currentView === 'event-details' && selectedEventId && (
        <EventDetails eventId={selectedEventId} onBookTickets={handleBookTickets} onBack={handleBackToEvents} />
      )}

      {currentView === 'fan' && (
        <div className="flex min-h-screen flex-col bg-gray-50">
          <UserAppNavbar
            activeSection={fanSection}
            onSectionChange={setFanSection}
            sectionTitle={fanAppSectionTitle(fanSection)}
            onDiscoverEvents={() => setFanSection('discovery')}
            onLogin={() => setCurrentView('login')}
            onLogout={() => {
              authService.logout();
              setCurrentView('login');
            }}
            upcomingTicketCount={upcomingTicketCount}
            favoritesCount={accountBadgeCounts.favorites}
          />
          {fanSection === 'discovery' ? (
            <UserDiscovery onEventSelect={handleEventSelect} />
          ) : (
            <UserDashboard
              activeView={fanSection}
              onDiscoverEvents={() => setFanSection('discovery')}
              onLogin={() => setCurrentView('login')}
            />
          )}
        </div>
      )}

      <TicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventId={selectedEventId}
        onReservationSuccess={(commandeId) => {
          setIsModalOpen(false);
          setRecapCommandeId(commandeId);
        }}
      />

      {recapCommandeId != null && (
        <div className="fixed inset-0 z-[150] overflow-y-auto bg-slate-50">
          <CommandeRecap
            commandeId={recapCommandeId}
            onBack={() => setRecapCommandeId(null)}
          />
        </div>
      )}
    </div>
  );
}
