export type FantasyLeagueStatus = 'draft' | 'open' | 'active' | 'closed';
export type FantasyMembershipState = 'pending' | 'approved' | 'rejected';
export type FantasyMembershipRole = 'participant' | 'owner';
export type FantasyTournamentStatus = 'draft_pending' | 'active' | 'completed';

export type FantasyLeague = {
  id: string;
  organizationId: string;
  name: string;
  ownerUserId: string;
  requiredApprovedParticipants: number;
  maxParticipants: number;
  participantIds: string[];
  seasonId?: string;
  status: FantasyLeagueStatus;
};

export type FantasyMembership = {
  id: string;
  leagueId: string;
  userId: string;
  role: FantasyMembershipRole;
  state: FantasyMembershipState;
  requestedAt?: string;
  reviewedAt?: string;
  reviewedByUserId?: string;
  note?: string;
};

export type FantasyTournament = {
  id: string;
  leagueId: string;
  seasonId: string;
  tournamentNumber: number;
  name: string;
  status: FantasyTournamentStatus;
  participantIds: string[];
  scheduledAt?: string;
};

export type FantasyStandingsEntry = {
  userId: string;
  teamName?: string;
  totalPoints: number;
  rank: number;
};

export type DraftPick = {
  id: string;
  userId: string;
  playerId: string;
  round?: number;
  pickNumber?: number;
  createdAt?: string;
};

export type DraftRoom = {
  id: string;
  leagueId: string;
  fantasyTournamentId: string;
  status: 'draft' | 'active' | 'completed';
  currentPick: number;
  currentUserId?: string;
  participantOrder: string[];
  picks: DraftPick[];
};

export type CreateFantasyLeagueInput = {
  name?: string;
  ownerUserId?: string;
  requiredApprovedParticipants?: number;
  maxParticipants?: number;
  participantIds?: string[];
  seasonId?: string;
};

export type JoinFantasyLeagueInput = {
  userId?: string;
  role?: FantasyMembershipRole;
};

export type CreateFantasyTournamentInput = {
  seasonId?: string;
  name?: string;
  tournamentNumber?: number;
  scheduledAt?: string;
};

export type SeedLeagueInput = {
  name?: string;
  ownerUserId?: string;
  participantUserIds?: string[];
  seasonId?: string;
  tournamentCount?: number;
  timerSeconds?: number;
};

export type DraftPickInput = {
  userId: string;
  playerId: string;
  round?: number;
  pickNumber?: number;
};
