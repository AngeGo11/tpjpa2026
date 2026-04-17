import React from 'react';
import {
  User as UserIcon,
  Ticket,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  HelpCircle,
  ChevronDown,
  Compass,
} from 'lucide-react';
import type { FanAppSection } from './user-dashboard';
import { authService } from '../services/authService';
import { getUserDisplayName, getUserFirstName, getUserInitials, type User } from '../services/userService';

type HubRowProps = {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badge?: React.ReactNode;
};

function HubRow({ icon, label, isActive, onClick, badge }: HubRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
        isActive
          ? 'border-l-[3px] border-festigo bg-festigo/10 text-festigo shadow-sm'
          : 'border-l-[3px] border-transparent text-gray-800 hover:bg-gray-50'
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          isActive ? 'bg-festigo/15 text-festigo' : 'bg-gray-100 text-gray-500'
        }`}
      >
        {icon}
      </span>
      <span className={`min-w-0 flex-1 text-sm font-semibold ${isActive ? 'text-festigo' : 'text-gray-800'}`}>
        {label}
      </span>
      {badge}
      <ChevronRight className={`h-5 w-5 shrink-0 ${isActive ? 'text-festigo/50' : 'text-gray-400'}`} aria-hidden />
    </button>
  );
}

type AccountMenuPanelProps = {
  activeView: FanAppSection;
  onSelectView: (view: FanAppSection) => void;
  upcomingTicketCount: number;
  favoritesCount: number;
  currentUser: User | null;
  onLogout?: () => void;
  onLogin?: () => void;
};

function AccountMenuPanel({
  activeView,
  onSelectView,
  upcomingTicketCount,
  favoritesCount,
  currentUser,
  onLogout,
  onLogin,
}: AccountMenuPanelProps) {
  const initials = currentUser ? getUserInitials(currentUser) : '?';
  const displayName = currentUser ? getUserDisplayName(currentUser) : 'Invité';
  const subtitle = currentUser ? currentUser.email : 'Non connecté';

  return (
    <div className="festigo-account-hub-fade-in w-[min(100vw-2rem,22rem)] rounded-3xl border border-gray-100 bg-white p-5 shadow-xl shadow-gray-200/60 sm:p-6">
      <div className="flex gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-festigo text-base font-bold text-white sm:h-14 sm:w-14 sm:text-lg">
          {initials}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="truncate text-lg font-semibold text-gray-900 sm:text-xl">{displayName}</p>

          <p className="truncate text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>

      <div className="mb-3 mt-3 border-b border-gray-100 sm:mb-4 sm:mt-4" />

      <div className="space-y-1">
        <HubRow
          icon={<Compass className="h-5 w-5" />}
          label="Découverte"
          isActive={activeView === 'discovery'}
          onClick={() => onSelectView('discovery')}
        />
        <HubRow
          icon={<UserIcon className="h-5 w-5" />}
          label="Profil"
          isActive={activeView === 'profile'}
          onClick={() => onSelectView('profile')}
        />
        <HubRow
          icon={<Ticket className="h-5 w-5" />}
          label="Mes billets"
          isActive={activeView === 'tickets'}
          onClick={() => onSelectView('tickets')}
          badge={
            <span className="rounded-full bg-festigo px-2 py-0.5 text-xs font-bold text-white tabular-nums">
              {upcomingTicketCount}
            </span>
          }
        />
        <HubRow
          icon={<Heart className="h-5 w-5" />}
          label="Favoris"
          isActive={activeView === 'favorites'}
          onClick={() => onSelectView('favorites')}
          badge={
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-bold text-gray-700 tabular-nums">
              {favoritesCount}
            </span>
          }
        />
      </div>

      <div className="my-2 border-t border-gray-100 pt-2 sm:my-3 sm:pt-3">
        <div className="space-y-1">
          <HubRow
            icon={<Settings className="h-5 w-5" />}
            label="Sécurité & confidentialité"
            isActive={activeView === 'settings'}
            onClick={() => onSelectView('settings')}
          />
          <HubRow
            icon={<HelpCircle className="h-5 w-5" />}
            label="Aide & support"
            isActive={activeView === 'help'}
            onClick={() => onSelectView('help')}
          />
        </div>
      </div>

      <div className="mt-1 border-t border-gray-100 pt-2 sm:pt-3">
        {currentUser ? (
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl border-l-[3px] border-transparent px-3 py-3 text-left text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <LogOut className="h-5 w-5" />
            </span>
            <span className="flex-1 text-sm font-semibold">Déconnexion</span>
            <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            onClick={onLogin}
            className="flex w-full items-center gap-3 rounded-xl border-l-[3px] border-transparent px-3 py-3 text-left text-festigo transition-colors hover:bg-festigo/10"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-festigo/15 text-festigo">
              <UserIcon className="h-5 w-5" />
            </span>
            <span className="flex-1 text-sm font-semibold">Connexion</span>
            <ChevronRight className="h-5 w-5 shrink-0 text-festigo/50" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}

export interface UserAppNavbarProps {
  activeSection: FanAppSection;
  onSectionChange: (view: FanAppSection) => void;
  sectionTitle: string;
  onDiscoverEvents?: () => void;
  onLogin?: () => void;
  onLogout?: () => void;
  upcomingTicketCount: number;
  favoritesCount: number;
}

export function UserAppNavbar({
  activeSection,
  onSectionChange,
  sectionTitle,
  onDiscoverEvents,
  onLogin,
  onLogout,
  upcomingTicketCount,
  favoritesCount,
}: UserAppNavbarProps) {
  const currentUser = authService.getCurrentUser();
  const initials = currentUser ? getUserInitials(currentUser) : '?';
  const navFirstName = currentUser ? getUserFirstName(currentUser) : 'Invité';

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-baseline gap-1.5 sm:gap-2">
          <span className="shrink-0 text-sm font-bold text-gray-900 sm:text-base">
            FestiGo<span className="text-festigo">.</span>
          </span>
          <span className="shrink-0 text-gray-300" aria-hidden>
            /
          </span>
          <span className="min-w-0 truncate text-xs font-medium text-gray-500 sm:text-sm">{sectionTitle}</span>
        </div>

        {(onDiscoverEvents || onLogin || onLogout) && (
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            {onDiscoverEvents && activeSection !== 'discovery' && (
              <button
                type="button"
                onClick={onDiscoverEvents}
                className="rounded-lg px-3 py-2 text-sm font-medium text-festigo transition-colors hover:bg-festigo/10"
              >
                Explorer
              </button>
            )}
            {currentUser && onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                Se déconnecter
              </button>
            )}
            {!currentUser && onLogin && (
              <button
                type="button"
                onClick={onLogin}
                className="rounded-lg bg-festigo px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-festigo-hover"
              >
                Connexion
              </button>
            )}
          </div>
        )}

        <div className="group relative shrink-0">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-transparent px-2 py-1.5 text-left transition-colors hover:bg-gray-50 group-hover:border-gray-100 group-focus-within:border-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-festigo focus-visible:ring-offset-2"
            aria-haspopup="menu"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-festigo text-xs font-bold text-white sm:h-10 sm:w-10 sm:text-sm">
              {initials}
            </span>
            <span className="hidden min-w-0 max-w-[9rem] sm:block">
              <span className="block truncate text-sm font-semibold text-gray-900">{navFirstName}</span>
              <span className="block truncate text-xs text-gray-500">{currentUser ? 'Mon compte' : 'Connexion'}</span>
            </span>
            <ChevronDown
              className="hidden h-4 w-4 text-gray-400 transition-transform group-hover:rotate-180 sm:block"
              aria-hidden
            />
          </button>

          <div
            className="pointer-events-none invisible absolute right-0 top-full z-50 pt-2 opacity-0 transition-all duration-200 ease-out group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100"
            role="presentation"
          >
            <div className="pointer-events-auto">
              <AccountMenuPanel
                activeView={activeSection}
                onSelectView={onSectionChange}
                upcomingTicketCount={upcomingTicketCount}
                favoritesCount={favoritesCount}
                currentUser={currentUser}
                onLogout={onLogout}
                onLogin={onLogin}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
