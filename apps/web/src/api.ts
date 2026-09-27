import { createApiClient } from "@shared";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

const client = createApiClient(API_URL);

export async function fetchPlayerRecap(slug: string, videogameId: string) {
  const { data, error } = await client.api.v1
    .players({ slug })
    .recap.get({ query: videogameId ? { videogameId } : {} });

  if (error) throw new Error(`Failed to fetch player recap: ${error.status}`);
  if ("error" in data) throw new Error(data.message);
  return data;
}

export async function fetchTournamentOrganizerRecap(slug: string) {
  const { data, error } = await client.api.v1["tournament-organizers"]({ slug }).recap.get();

  if (error) throw new Error(`Failed to fetch tournament organizer recap: ${error.status}`);
  if ("error" in data) throw new Error(data.message);
  return data;
}
