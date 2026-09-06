import type { UserRole } from '@flihub/core';

export type { UserRole };

export interface MockUser {
  readonly id: string;
  readonly name: string;
  readonly organizationId: string;
  readonly role: UserRole;
  readonly playerId?: string;
}

export const mockUsers: readonly MockUser[] = [
  {
    id: 'player-1',
    name: 'Alex Rivera',
    organizationId: 'fgl',
    role: 'player',
    playerId: 'player-1'
  },
  {
    id: 'player-2',
    name: 'Jordan Blake',
    organizationId: 'fgl',
    role: 'player',
    playerId: 'player-2'
  },
  {
    id: 'staff-1',
    name: 'Jamie Chen',
    organizationId: 'fgl',
    role: 'business_staff'
  },
  {
    id: 'staff-2',
    name: 'Taylor Morgan',
    organizationId: 'fgl',
    role: 'business_staff'
  },
  {
    id: 'admin-1',
    name: 'Morgan Reyes',
    organizationId: 'fgl',
    role: 'admin'
  },
  {
    id: 'leader-1',
    name: 'Dakota Shaw',
    organizationId: 'fgl',
    role: 'leader'
  },
  {
    id: 'manager-1',
    name: 'Jordan Ellis',
    organizationId: 'fgl',
    role: 'manager'
  },
  {
    id: 'broadcaster-1',
    name: 'Skyler Ames',
    organizationId: 'fgl',
    role: 'broadcaster'
  },
  {
    id: 'staff-3',
    name: 'Riley Patel',
    organizationId: 'org-2',
    role: 'business_staff'
  },
  {
    id: 'player-6',
    name: 'Avery Brooks',
    organizationId: 'org-2',
    role: 'player',
    playerId: 'player-6'
  }
];
