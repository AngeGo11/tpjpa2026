import React, { useCallback, useEffect, useState } from 'react';
import { OrganizerDashboard } from './components/organizer-dashboard';
import { UserDiscovery } from './components/user-discovery';
import { EventDetails } from './components/event-details';
import { TicketModal } from './components/ticket-modal';
import { CommandeRecap } from './components/commande-recap';
import { LoginFestive } from './components/login-festive';
import { SignupFestive } from './components/signup-festive';
import { AdminSettings } from './components/admin-settings';
import { UserDashboard, fanAppSectionTitle, type FanAppSection } from './components/user-dashboard';
import { UserAppNavbar } from './components/user-app-navbar';
import { authService } from './services/authService';
import { countUserUpcomingTickets } from './services/userTicketsService';
import * as favoriteService from './services/favoriteService';

type View = 'dashboard' | 'event-details' | 'login' | 'signup' | 'admin-settings' | 'fan';

export default function App() {
  // L'état initial est calculé en fonction de l'utilisateur stocké dans le localStorage
  const [currentView, setCurrentView] = useState<View>(() => {
    const user = authService.getCurrentUser();
    if (user && user.role === 'Organizer') {
      return 'dashboard';
    }
    return 'fan'; // Par défaut, vue fan (découverte)
  });

  const [fanSection, setFanSection] = useState<FanAppSection>('discovery');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [recapCommandeId, setRecapCommandeId] = useState<number | null>(null);
  const [upcomingTicketCount, setUpcomingTicketCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);

  const refreshFavoritesCount = useCallback(() => {
    const u = authService.getCurrentUser();
    if (!u?.id) {
      setFavoritesCount(0);
      return;
    }
    void favoriteService
      .getFavoriteEvents(u.id)
      .then((list) => setFavoritesCount(list.length))
      .catch(() => setFavoritesCount(0));
  }, []);

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
    // Appel sécurisé si countUserUpcomingTickets est implémenté
    if (typeof countUserUpcomingTickets === 'function') {
        countUserUpcomingTickets(u.id)
          .then(setUpcomingTicketCount)
          .catch(() => setUpcomingTicketCount(0));
    }
  }, [currentView, fanSection, recapCommandeId]);

  useEffect(() => {
    if (currentView !== 'fan') {
      setFavoritesCount(0);
      return;
    }
    refreshFavoritesCount();
  }, [currentView, fanSection, refreshFavoritesCount]);

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
    refreshFavoritesCount();
  };

  const handleOpenEventFromAccount = (eventId: number) => {
    setSelectedEventId(eventId);
    setCurrentView('event-details');
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
            setCurrentView('login'); // Rediriger vers login après déconnexion
          }}
        />
      )}
      {currentView === 'event-details' && selectedEventId && (
        <EventDetails
          eventId={selectedEventId}
          onBookTickets={handleBookTickets}
          onBack={handleBackToEvents}
          onFavoritesChanged={refreshFavoritesCount}
        />
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
              setCurrentView('login'); // Rediriger vers login après déconnexion
            }}
            upcomingTicketCount={upcomingTicketCount}
            favoritesCount={favoritesCount}
          />
          {fanSection === 'discovery' ? (
            <UserDiscovery
              key={authService.getCurrentUser()?.id ?? 'guest'}
              onEventSelect={handleEventSelect}
              onFavoritesChanged={refreshFavoritesCount}
            />
          ) : (
            <UserDashboard
              activeView={fanSection}
              onDiscoverEvents={() => setFanSection('discovery')}
              onLogin={() => setCurrentView('login')}
              onFavoritesChanged={refreshFavoritesCount}
              onOpenEvent={handleOpenEventFromAccount}
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
