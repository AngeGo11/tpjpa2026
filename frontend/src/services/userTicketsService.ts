import { billetService } from './billetService';
import { eventService, type Event } from './eventService';
import { typeBilletService, TypeBilletType } from './typeBilletService';

function labelTypeBillet(type: TypeBilletType): string {
  switch (type) {
    case TypeBilletType.GrandPublic:
      return 'Grand public';
    case TypeBilletType.VIP:
      return 'VIP';
    case TypeBilletType.VVIP:
      return 'VVIP';
  }
}

function parseEventStartMs(ev: Event): number {
  try {
    const raw = ev.date;
    const day =
      typeof raw === 'string' ? (raw.includes('T') ? raw.split('T')[0] : raw.slice(0, 10)) : '';
    const h = ev.heure != null ? String(ev.heure) : '12:00:00';
    const timePart = h.length === 5 ? `${h}:00` : h.length >= 8 ? h.slice(0, 8) : `${h}:00`;
    const d = new Date(`${day}T${timePart}`);
    if (!Number.isNaN(d.getTime())) return d.getTime();
  } catch {
    /* ignore */
  }
  return new Date(ev.date).getTime();
}

function formatTicketStrip(eventMs: number, heure: string | undefined) {
  const d = new Date(eventMs);
  const timeLabel = heure != null ? String(heure).slice(0, 5) : d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const dateLabel = d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const monthShort = d
    .toLocaleDateString('fr-FR', { month: 'short' })
    .replace('.', '')
    .toUpperCase()
    .slice(0, 4);
  return {
    dateLabel,
    timeLabel,
    monthShort,
    dayNum: String(d.getDate()),
    yearStr: String(d.getFullYear()),
  };
}

export interface UserTicketView {
  id: number;
  commandeId: number;
  eventName: string;
  dateLabel: string;
  timeLabel: string;
  venue: string;
  ticketType: string;
  status: 'upcoming' | 'past';
  qrCode: string;
  orderNumber: string;
  eventMs: number;
  monthShort: string;
  dayNum: string;
  yearStr: string;
}

/**
 * Tous les billets de l’utilisateur (API unique côté backend), avec événement et type enrichis.
 */
export async function fetchUserTickets(userId: number): Promise<UserTicketView[]> {
  const billets = await billetService.getBilletsForUser(userId);
  const typeCache = new Map<number, Awaited<ReturnType<typeof typeBilletService.getTypeBilletById>>>();
  const eventCache = new Map<number, Event>();
  const rows: UserTicketView[] = [];

  for (const b of billets) {
    let tb = typeCache.get(b.typeBilletId);
    if (!tb) {
      tb = await typeBilletService.getTypeBilletById(b.typeBilletId);
      typeCache.set(b.typeBilletId, tb);
    }
    const eventId = tb.eventId;
    if (eventId == null) continue;

    let ev = eventCache.get(eventId);
    if (!ev) {
      ev = await eventService.getEventById(eventId);
      eventCache.set(eventId, ev);
    }

    const eventMs = parseEventStartMs(ev);
    const status: 'upcoming' | 'past' = eventMs >= Date.now() ? 'upcoming' : 'past';
    const fmt = formatTicketStrip(eventMs, ev.heure);

    rows.push({
      id: b.id,
      commandeId: b.commandeId,
      eventName: ev.nom,
      dateLabel: fmt.dateLabel,
      timeLabel: fmt.timeLabel,
      venue: ev.lieu,
      ticketType: labelTypeBillet(tb.type),
      status,
      qrCode: b.codeBarre,
      orderNumber: `#CMD-${b.commandeId}`,
      eventMs,
      monthShort: fmt.monthShort,
      dayNum: fmt.dayNum,
      yearStr: fmt.yearStr,
    });
  }

  return rows.sort((a, b) => b.eventMs - a.eventMs);
}

export async function countUserUpcomingTickets(userId: number): Promise<number> {
  const all = await fetchUserTickets(userId);
  return all.filter((t) => t.status === 'upcoming').length;
}
