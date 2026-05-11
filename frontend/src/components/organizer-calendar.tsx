import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Clock, Music, Users, X, CalendarDays } from 'lucide-react';
import { Event } from '../services/eventService';
import { parseEventStartMs } from '../services/userTicketsService';

type OrganizerCalendarProps = {
  events: Event[];
  isLoading?: boolean;
};

const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

/** Renvoie une clé "YYYY-MM-DD" en local pour comparer aux cases du calendrier. */
function toLocalDayKey(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dayKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function OrganizerCalendar({ events, isLoading = false }: OrganizerCalendarProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  /** Index { "YYYY-MM-DD" -> Event[] } pour un accès rapide depuis chaque case. */
  const eventsByDay = useMemo(() => {
    const map = new Map<string, Event[]>();
    for (const ev of events) {
      const ms = parseEventStartMs(ev);
      if (!Number.isFinite(ms)) continue;
      const key = toLocalDayKey(ms);
      const list = map.get(key);
      if (list) list.push(ev);
      else map.set(key, [ev]);
    }
    for (const list of map.values()) {
      list.sort((a, b) => parseEventStartMs(a) - parseEventStartMs(b));
    }
    return map;
  }, [events]);

  /** Construit la grille du mois (avec les jours du mois précédent/suivant pour remplir). */
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Jour de la semaine du 1er (0 = Dimanche en JS). On veut Lundi en premier.
    const firstWeekday = (firstDayOfMonth.getDay() + 6) % 7;

    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const cells: Array<{ year: number; month: number; day: number; inCurrentMonth: boolean }> = [];

    for (let i = firstWeekday - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const date = new Date(currentYear, currentMonth - 1, day);
      cells.push({ year: date.getFullYear(), month: date.getMonth(), day, inCurrentMonth: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ year: currentYear, month: currentMonth, day: d, inCurrentMonth: true });
    }

    while (cells.length % 7 !== 0) {
      const last = cells[cells.length - 1];
      const date = new Date(last.year, last.month, last.day + 1);
      cells.push({ year: date.getFullYear(), month: date.getMonth(), day: date.getDate(), inCurrentMonth: false });
    }

    while (cells.length < 42) {
      const last = cells[cells.length - 1];
      const date = new Date(last.year, last.month, last.day + 1);
      cells.push({ year: date.getFullYear(), month: date.getMonth(), day: date.getDate(), inCurrentMonth: false });
    }

    return cells;
  }, [currentYear, currentMonth]);

  const monthEvents = useMemo(() => {
    return events
      .filter((ev) => {
        const ms = parseEventStartMs(ev);
        if (!Number.isFinite(ms)) return false;
        const d = new Date(ms);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      })
      .sort((a, b) => parseEventStartMs(a) - parseEventStartMs(b));
  }, [events, currentYear, currentMonth]);

  const todayKey = toLocalDayKey(Date.now());

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  };

  const formatEventTime = (ev: Event) => {
    if (ev.heure) return ev.heure.substring(0, 5);
    const ms = parseEventStartMs(ev);
    if (!Number.isFinite(ms)) return '';
    return new Date(ms).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Calendrier des événements</h2>
        <p className="mt-1 text-sm text-gray-500">
          Visualisez tous vos événements organisés dans une vue mensuelle
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-festigo/10">
              <CalendarDays className="h-5 w-5 text-festigo" />
            </div>
            <div>
              <h3 className="text-lg font-semibold capitalize text-gray-900">
                {MONTHS_FR[currentMonth]} {currentYear}
              </h3>
              <p className="text-xs text-gray-500">
                {monthEvents.length} événement{monthEvents.length > 1 ? 's' : ''} ce mois-ci
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToToday}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              Aujourd'hui
            </button>
            <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                aria-label="Mois précédent"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goToNextMonth}
                className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                aria-label="Mois suivant"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-gray-500">Chargement du calendrier...</div>
        ) : (
          <div className="p-2 sm:p-4">
            <div className="grid grid-cols-7 gap-1 border-b border-gray-100 pb-2">
              {WEEK_DAYS.map((d) => (
                <div
                  key={d}
                  className="py-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-1">
              {calendarCells.map((cell, idx) => {
                const key = dayKey(cell.year, cell.month, cell.day);
                const dayEvents = eventsByDay.get(key) || [];
                const isToday = key === todayKey;
                const hasEvents = dayEvents.length > 0;

                return (
                  <div
                    key={`${key}-${idx}`}
                    className={`relative flex min-h-[90px] flex-col rounded-lg border p-1.5 transition-colors sm:min-h-[110px] ${
                      cell.inCurrentMonth
                        ? 'border-gray-100 bg-white'
                        : 'border-gray-50 bg-gray-50/40'
                    } ${hasEvents && cell.inCurrentMonth ? 'hover:border-festigo/30' : ''}`}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                          isToday
                            ? 'bg-festigo text-white'
                            : cell.inCurrentMonth
                              ? 'text-gray-900'
                              : 'text-gray-400'
                        }`}
                      >
                        {cell.day}
                      </span>
                      {hasEvents && cell.inCurrentMonth && (
                        <span className="rounded-full bg-festigo/10 px-1.5 py-0.5 text-[10px] font-semibold text-festigo">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((ev) => (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => setSelectedEvent(ev)}
                          className="group/event w-full truncate rounded-md bg-festigo/10 px-1.5 py-1 text-left text-[11px] font-medium text-festigo transition-colors hover:bg-festigo hover:text-white"
                          title={ev.nom}
                        >
                          <span className="mr-1 opacity-70">{formatEventTime(ev)}</span>
                          <span className="truncate">{ev.nom}</span>
                        </button>
                      ))}
                      {dayEvents.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setSelectedEvent(dayEvents[2])}
                          className="rounded-md px-1.5 py-0.5 text-left text-[10px] font-medium text-gray-500 hover:text-festigo"
                        >
                          + {dayEvents.length - 2} autre{dayEvents.length - 2 > 1 ? 's' : ''}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-base font-semibold text-gray-900">
            Événements de {MONTHS_FR[currentMonth].toLowerCase()} {currentYear}
          </h3>
        </div>
        {monthEvents.length === 0 ? (
          <div className="py-12 text-center">
            <CalendarDays className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">Aucun événement prévu ce mois-ci.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {monthEvents.map((ev) => {
              const ms = parseEventStartMs(ev);
              const date = new Date(ms);
              return (
                <li key={ev.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(ev)}
                    className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-gray-50"
                  >
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-festigo/20 bg-festigo/5">
                      <span className="text-[10px] font-semibold uppercase text-festigo">
                        {date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')}
                      </span>
                      <span className="text-xl font-bold leading-none text-gray-900">
                        {date.getDate()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">{ev.nom}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatEventTime(ev)}
                        </span>
                        <span className="inline-flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{ev.lieu || 'Lieu non précisé'}</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {ev.nbPlaces} places
                        </span>
                      </div>
                    </div>
                    <span className="hidden shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold uppercase text-gray-600 sm:inline-block">
                      {ev.genreMusical}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-festigo">
                  Événement
                </p>
                <h3 className="mt-1 text-lg font-bold text-gray-900">{selectedEvent.nom}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-gray-50 p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Date
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(parseEventStartMs(selectedEvent)).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    <Clock className="h-3.5 w-3.5" />
                    Heure
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatEventTime(selectedEvent)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <MapPin className="h-3.5 w-3.5" />
                  Lieu
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedEvent.lieu || 'Non précisé'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-gray-50 p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    <Music className="h-3.5 w-3.5" />
                    Genre
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{selectedEvent.genreMusical}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    <Users className="h-3.5 w-3.5" />
                    Capacité
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedEvent.nbPlaces} places
                  </p>
                </div>
              </div>

              {selectedEvent.description && (
                <div>
                  <p className="mb-1 text-xs font-medium text-gray-500">Description</p>
                  <p className="text-sm leading-relaxed text-gray-700">
                    {selectedEvent.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
