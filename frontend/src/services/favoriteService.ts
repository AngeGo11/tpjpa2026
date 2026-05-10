import { fetchApi } from './api';
import type { Event } from './eventService';

export async function getFavoriteEvents(userId: number): Promise<Event[]> {
  return fetchApi<Event[]>(`/users/${userId}/favorites/events`);
}

export async function getFavoriteStatus(userId: number, eventId: number): Promise<boolean> {
  const r = await fetchApi<{ favorited: boolean }>(
    `/users/${userId}/favorites/events/${eventId}/status`
  );
  return Boolean(r.favorited);
}

export async function addFavorite(userId: number, eventId: number): Promise<void> {
  await fetchApi<void>(`/users/${userId}/favorites/events/${eventId}`, {
    method: 'PUT',
  });
}

export async function removeFavorite(userId: number, eventId: number): Promise<void> {
  await fetchApi<void>(`/users/${userId}/favorites/events/${eventId}`, {
    method: 'DELETE',
  });
}
