import { api } from '@/services/api/endpoints';
import { apiRequest } from '@/services/api/client';
import type {
  CreateFantasyLeagueInput,
  CreateFantasyTournamentInput,
  DraftPickInput,
  FantasyLeague,
  FantasyMembership,
  FantasyStandingsEntry,
  FantasyTournament,
  JoinFantasyLeagueInput,
  SeedLeagueInput,
} from '@/types/fantasy';
import type { AuthSession } from '@/types/auth';

export async function fetchFantasyLeagues(orgId?: string, session?: AuthSession) {
  const query = orgId ? `?organizationId=${encodeURIComponent(orgId)}` : '';
  return apiRequest<FantasyLeague[]>(`${api.fantasy.leagues}${query}`, {}, session);
}

export async function createFantasyLeague(input: CreateFantasyLeagueInput, session?: AuthSession) {
  return apiRequest<FantasyLeague>(api.fantasy.leagues, {
    method: 'POST',
    body: JSON.stringify(input),
  }, session);
}

export async function requestJoinFantasyLeague(
  leagueId: string,
  input: JoinFantasyLeagueInput,
  session?: AuthSession
) {
  return apiRequest<FantasyMembership>(api.fantasy.requestJoin(leagueId), {
    method: 'POST',
    body: JSON.stringify(input),
  }, session);
}

export async function fetchFantasyLeagueMemberships(leagueId: string, session?: AuthSession) {
  return apiRequest<FantasyMembership[]>(api.fantasy.leagues, {}, session);
}

export async function approveFantasyMembership(
  leagueId: string,
  membershipId: string,
  session?: AuthSession
) {
  return apiRequest<{
    membership: FantasyMembership;
    league: FantasyLeague;
  }>(api.fantasy.approveMembership(leagueId, membershipId), {
    method: 'PUT',
    body: JSON.stringify({ reviewerUserId: session?.userId ?? 'unknown-user' }),
  }, session);
}

export async function createFantasyTournament(
  leagueId: string,
  input: CreateFantasyTournamentInput,
  session?: AuthSession
) {
  return apiRequest<FantasyTournament>(api.fantasy.tournaments(leagueId), {
    method: 'POST',
    body: JSON.stringify(input),
  }, session);
}

export async function seedLeague(input: SeedLeagueInput, session?: AuthSession) {
  return apiRequest<FantasyLeague>(api.fantasy.seedLeague, {
    method: 'POST',
    body: JSON.stringify(input),
  }, session);
}

export async function fetchDraftRoom(draftId: string, session?: AuthSession) {
  return apiRequest<any>(api.fantasy.draft(draftId), {}, session);
}

export async function submitDraftPick(draftId: string, input: DraftPickInput, session?: AuthSession) {
  return apiRequest<any>(api.fantasy.draftsPick(draftId), {
    method: 'POST',
    body: JSON.stringify(input),
  }, session);
}

export async function fetchFantasyStandings(leagueId: string, session?: AuthSession) {
  return apiRequest<FantasyStandingsEntry[]>(`/fantasy/standings/${leagueId}`, {}, session);
}
