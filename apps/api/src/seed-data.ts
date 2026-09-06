import {
  Department,
  InMemoryDepartmentRepository,
  InMemoryProjectRepository,
  InMemoryReimbursementClaimRepository,
  Project
} from '@flihub/business';
import {
  InMemoryPlayerRepository,
  InMemoryTournamentRegistrationRepository,
  InMemoryTournamentRepository,
  Player,
  Tournament
} from '@flihub/league';

export const createBusinessRepositories = () => ({
  departments: new InMemoryDepartmentRepository([
    Department.create({
      id: 'department-1',
      organizationId: 'fgl',
      name: 'Operations'
    }),
    Department.create({
      id: 'department-2',
      organizationId: 'fgl',
      name: 'Marketing'
    }),
    Department.create({
      id: 'department-3',
      organizationId: 'fgl',
      name: 'Player Development'
    }),
    Department.create({
      id: 'department-4',
      organizationId: 'org-2',
      name: 'Course Operations'
    })
  ]),
  projects: new InMemoryProjectRepository([
    Project.create({
      id: 'project-1',
      departmentId: 'department-1',
      name: 'Tournament Launch'
    }),
    Project.create({
      id: 'project-2',
      departmentId: 'department-2',
      name: 'Season Media Campaign'
    }),
    Project.create({
      id: 'project-3',
      departmentId: 'department-3',
      name: 'Coaching Clinics'
    }),
    Project.create({
      id: 'project-4',
      departmentId: 'department-4',
      name: 'Course Fence'
    })
  ]),
  claims: new InMemoryReimbursementClaimRepository()
});

export const createLeagueRepositories = () => ({
  players: new InMemoryPlayerRepository([
    Player.create({
      id: 'player-1',
      organizationId: 'fgl',
      displayName: 'Alex Rivera'
    }),
    Player.create({
      id: 'player-2',
      organizationId: 'fgl',
      displayName: 'Jordan Blake'
    }),
    Player.create({
      id: 'player-3',
      organizationId: 'fgl',
      displayName: 'Sam Okafor'
    }),
    Player.create({
      id: 'player-4',
      organizationId: 'fgl',
      displayName: 'Casey Nguyen'
    }),
    Player.create({
      id: 'player-5',
      organizationId: 'fgl',
      displayName: 'Morgan Lee',
      active: false
    }),
    Player.create({
      id: 'player-6',
      organizationId: 'org-2',
      displayName: 'Avery Brooks'
    })
  ]),
  tournaments: new InMemoryTournamentRepository([
    Tournament.create({
      id: 'tournament-1',
      organizationId: 'fgl',
      seasonId: 'season-1',
      name: 'Spring Open',
      capacity: 32
    }),
    Tournament.create({
      id: 'tournament-2',
      organizationId: 'fgl',
      seasonId: 'season-1',
      name: 'Summer Championship',
      capacity: 16
    }),
    Tournament.create({
      id: 'tournament-3',
      organizationId: 'org-2',
      seasonId: 'season-2',
      name: 'Course Community Cup',
      capacity: 24
    })
  ]),
  registrations: new InMemoryTournamentRegistrationRepository()
});
