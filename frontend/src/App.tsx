import React, { useState } from 'react';
import { OrganizerDashboard } from './components/organizer-dashboard';
import { UserDiscovery } from './components/user-discovery';
import { EventDetails } from './components/event-details';
import { TicketModal } from './components/ticket-modal';
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

type View = 'dashboard' | 'event-details' | 'login' | 'signup' | 'admin-settings' | 'fan';

const accountBadgeCounts = getUserAccountMenuBadgeCounts();

export default function App() {
  const [currentView, setCurrentView] = useState<View>('fan');
  const [fanSection, setFanSection] = useState<FanAppSection>('discovery');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEventSelect = (eventId: number) => {
    setCurrentView('event-details');
  };

  const handleBookTickets = () => {
    setIsModalOpen(true);
  };

  const handleBackToEvents = () => {
    setCurrentView('fan');
    setFanSection('discovery');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* View Switcher - Demo only */}
      <div className="fixed bottom-8 left-1/2 z-50 flex max-w-[90vw] -translate-x-1/2 flex-wrap justify-center gap-1 rounded-xl border border-border bg-card p-1.5 shadow-md">
        <button
          onClick={() => setCurrentView('login')}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${currentView === 'login' ? 'bg-accent text-accent-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
        >
          Login
        </button>
        <button
          onClick={() => setCurrentView('signup')}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${currentView === 'signup' ? 'bg-accent text-accent-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
        >
          Sign Up
        </button>
        <button
          onClick={() => {
            setCurrentView('fan');
            setFanSection('discovery');
          }}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${currentView === 'fan' ? 'bg-accent text-accent-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
        >
          Fan (Découverte)
        </button>
        <button
          onClick={() => setCurrentView('event-details')}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${currentView === 'event-details' ? 'bg-accent text-accent-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
        >
          Event Details
        </button>
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${currentView === 'dashboard' ? 'bg-accent text-accent-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
        >
          Organizer
        </button>
      </div>

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
      {currentView === 'signup' && <SignupFestive onNavigateToLogin={() => setCurrentView('login')} />}
      {currentView === 'dashboard' && <OrganizerDashboard />}
      {currentView === 'event-details' && (
        <EventDetails onBookTickets={handleBookTickets} onBack={handleBackToEvents} />
      )}

      {currentView === 'fan' && (
        <div className="flex min-h-screen flex-col bg-gray-50">
          <UserAppNavbar
            activeSection={fanSection}
            onSectionChange={setFanSection}
            sectionTitle={fanAppSectionTitle(fanSection)}
            onDiscoverEvents={() => setFanSection('discovery')}
            onLogin={() => setCurrentView('login')}
            upcomingTicketCount={accountBadgeCounts.upcomingTickets}
            favoritesCount={accountBadgeCounts.favorites}
          />
          {fanSection === 'discovery' ? (
            <UserDiscovery onEventSelect={handleEventSelect} />
          ) : (
            <UserDashboard activeView={fanSection} onDiscoverEvents={() => setFanSection('discovery')} />
          )}
        </div>
      )}

      <TicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
