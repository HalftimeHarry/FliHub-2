export type UserRole = 'player' | 'business_staff' | 'admin';

export interface MockUser {
  readonly id: string;
  readonly name: string;
  readonly role: UserRole;
  readonly playerId?: string;
}

export const mockUsers: readonly MockUser[] = [
  { id: 'player-1', name: 'Alex Rivera', role: 'player', playerId: 'player-1' },
  { id: 'player-2', name: 'Jordan Blake', role: 'player', playerId: 'player-2' },
  { id: 'staff-1', name: 'Jamie Chen', role: 'business_staff' },
  { id: 'staff-2', name: 'Taylor Morgan', role: 'business_staff' },
  { id: 'admin-1', name: 'Morgan Reyes', role: 'admin' }
];
