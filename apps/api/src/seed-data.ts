import { Organization } from '@flihub/core';
import {
  FantasyLeague,
  FantasyTeam,
  InMemoryDraftRoomRepository,
  InMemoryFantasyLeagueRepository,
  InMemoryFantasyTeamRepository
} from '@flihub/fantasy';
import {
  Department,
  InMemoryDepartmentRepository,
  InMemoryProjectRepository,
  InMemoryReimbursementClaimRepository,
  Project
} from '@flihub/business';
import {
  Course,
  Hole,
  InMemoryCourseRepository,
  InMemoryHoleRepository,
  InMemoryPlayerRepository,
  InMemoryTeamRepository,
  InMemoryTournamentRegistrationRepository,
  InMemoryTournamentRepository,
  Player,
  Team,
  Tournament
} from '@flihub/league';

const defaultOrganizationSeeds = [
  Organization.create({
    id: 'fgl',
    name: 'FLI Golf',
    type: 'operator',
    paysTeams: true,
    enabledComponents: [
      'league-operations',
      'fli-golf-format',
      'fantasy',
      'payouts',
      'teams-and-rosters',
      'courses-and-scoring',
      'sponsorship',
      'community-content'
    ]
  }),
  Organization.create({
    id: 'org-2',
    name: 'Example School',
    type: 'school',
    paysTeams: false
  }),
  Organization.create({
    id: 'org-custom',
    name: 'Custom Demo League',
    type: 'school',
    paysTeams: false,
    enabledComponents: [
      'league-operations',
      'fli-golf-format',
      'teams-and-rosters',
      'courses-and-scoring',
      'sponsorship'
    ]
  })
] as const;

export const organizationSeeds: Organization[] = [
  defaultOrganizationSeeds[0],
  defaultOrganizationSeeds[1]
];

export const seedDefaultOrganizations = (): readonly Organization[] => {
  for (const organization of defaultOrganizationSeeds) {
    if (!organizationSeeds.some((seed) => seed.id.equals(organization.id))) {
      organizationSeeds.push(organization);
    }
  }

  return organizationSeeds;
};

export const findOrganization = (
  organizationId: string
): Organization | undefined =>
  organizationSeeds.find(
    (organization) => organization.id.value === organizationId
  );

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
      id: 'simon-lizotte',
      organizationId: 'fgl',
      displayName: 'Simon Lizotte',
      playerType: 'professional',
      gender: 'male'
    }),
    Player.create({
      id: 'kat-mertsch',
      organizationId: 'fgl',
      displayName: 'Kat Mertsch',
      playerType: 'professional',
      gender: 'female'
    }),
    Player.create({
      id: 'isaac-robinson',
      organizationId: 'fgl',
      displayName: 'Isaac Robinson',
      playerType: 'professional',
      gender: 'male'
    }),
    Player.create({
      id: 'missy-gannon',
      organizationId: 'fgl',
      displayName: 'Missy Gannon',
      playerType: 'professional',
      gender: 'female'
    }),
    Player.create({
      id: 'paul-mcbeth',
      organizationId: 'fgl',
      displayName: 'Paul McBeth',
      playerType: 'professional',
      gender: 'male'
    }),
    Player.create({
      id: 'holyn-handley',
      organizationId: 'fgl',
      displayName: 'Holyn Handley',
      playerType: 'professional',
      gender: 'female'
    }),
    Player.create({
      id: 'anthony-barela',
      organizationId: 'fgl',
      displayName: 'Anthony Barela',
      playerType: 'professional',
      gender: 'male'
    }),
    Player.create({
      id: 'hailey-king',
      organizationId: 'fgl',
      displayName: 'Hailey King',
      playerType: 'professional',
      gender: 'female'
    }),
    Player.create({
      id: 'chris-dickerson',
      organizationId: 'fgl',
      displayName: 'Chris Dickerson',
      playerType: 'professional',
      gender: 'male'
    }),
    Player.create({
      id: 'paige-pierce',
      organizationId: 'fgl',
      displayName: 'Paige Pierce',
      playerType: 'professional',
      gender: 'female'
    }),
    Player.create({
      id: 'kyle-klein',
      organizationId: 'fgl',
      displayName: 'Kyle Klein',
      playerType: 'professional',
      gender: 'male'
    }),
    Player.create({
      id: 'silva-saarinen',
      organizationId: 'fgl',
      displayName: 'Silva Saarinen',
      playerType: 'professional',
      gender: 'female'
    }),
    Player.create({
      id: 'niklas-anttila',
      organizationId: 'fgl',
      displayName: 'Niklas Anttila',
      playerType: 'professional',
      gender: 'male'
    }),
    Player.create({
      id: 'heidi-laine',
      organizationId: 'fgl',
      displayName: 'Heidi Laine',
      playerType: 'professional',
      gender: 'female'
    }),
    Player.create({
      id: 'calvin-heimburg',
      organizationId: 'fgl',
      displayName: 'Calvin Heimburg',
      playerType: 'professional',
      gender: 'male'
    }),
    Player.create({
      id: 'ohn-scoggins',
      organizationId: 'fgl',
      displayName: 'Ohn Scoggins',
      playerType: 'professional',
      gender: 'female'
    }),
    Player.create({
      id: 'ezra-robinson',
      organizationId: 'fgl',
      displayName: 'Ezra Robinson',
      playerType: 'professional',
      gender: 'male'
    }),
    Player.create({
      id: 'natalie-ryan',
      organizationId: 'fgl',
      displayName: 'Natalie Ryan',
      playerType: 'professional',
      gender: 'female'
    }),
    Player.create({
      id: 'ricky-wysocki',
      organizationId: 'fgl',
      displayName: 'Ricky Wysocki',
      playerType: 'professional',
      gender: 'male'
    }),
    Player.create({
      id: 'evelina-salonen',
      organizationId: 'fgl',
      displayName: 'Evelina Salonen',
      playerType: 'professional',
      gender: 'female'
    }),
    Player.create({
      id: 'gannon-buhr',
      organizationId: 'fgl',
      displayName: 'Gannon Buhr',
      playerType: 'professional',
      gender: 'male'
    }),
    Player.create({
      id: 'kristin-latt',
      organizationId: 'fgl',
      displayName: 'Kristin Latt',
      playerType: 'professional',
      gender: 'female'
    }),
    Player.create({
      id: 'matthew-orum',
      organizationId: 'fgl',
      displayName: 'Matthew Orum',
      playerType: 'professional',
      gender: 'male'
    }),
    Player.create({
      id: 'ella-hansen',
      organizationId: 'fgl',
      displayName: 'Ella Hansen',
      playerType: 'professional',
      gender: 'female'
    }),
    Player.create({
      id: 'avery-brooks',
      organizationId: 'org-2',
      displayName: 'Avery Brooks',
      playerType: 'student',
      schoolId: 'org-2',
      gender: 'female'
    })
  ]),
  teams: new InMemoryTeamRepository([
    Team.create({
      id: 'ace-makers',
      organizationId: 'fgl',
      name: 'Ace Makers',
      malePlayerId: 'simon-lizotte',
      femalePlayerId: 'kat-mertsch'
    }),
    Team.create({
      id: 'birdie-storm',
      organizationId: 'fgl',
      name: 'Birdie Storm',
      malePlayerId: 'isaac-robinson',
      femalePlayerId: 'missy-gannon'
    }),
    Team.create({
      id: 'chain-breakers',
      organizationId: 'fgl',
      name: 'Chain Breakers',
      malePlayerId: 'paul-mcbeth',
      femalePlayerId: 'holyn-handley'
    }),
    Team.create({
      id: 'chain-seekers',
      organizationId: 'fgl',
      name: 'Chain Seekers',
      malePlayerId: 'anthony-barela',
      femalePlayerId: 'hailey-king'
    }),
    Team.create({
      id: 'disc-dynasty',
      organizationId: 'fgl',
      name: 'Disc Dynasty',
      malePlayerId: 'chris-dickerson',
      femalePlayerId: 'paige-pierce'
    }),
    Team.create({
      id: 'disc-jesters',
      organizationId: 'fgl',
      name: 'Disc Jesters',
      malePlayerId: 'kyle-klein',
      femalePlayerId: 'silva-saarinen'
    }),
    Team.create({
      id: 'fairway-bombers',
      organizationId: 'fgl',
      name: 'Fairway Bombers',
      malePlayerId: 'niklas-anttila',
      femalePlayerId: 'heidi-laine'
    }),
    Team.create({
      id: 'flight-squad',
      organizationId: 'fgl',
      name: 'Flight Squad',
      malePlayerId: 'calvin-heimburg',
      femalePlayerId: 'ohn-scoggins'
    }),
    Team.create({
      id: 'glide-masters',
      organizationId: 'fgl',
      name: 'Glide Masters',
      malePlayerId: 'ezra-robinson',
      femalePlayerId: 'natalie-ryan'
    }),
    Team.create({
      id: 'huk-a-mania',
      organizationId: 'fgl',
      name: 'Huk-a-Mania',
      malePlayerId: 'ricky-wysocki',
      femalePlayerId: 'evelina-salonen'
    }),
    Team.create({
      id: 'hyzer-heros',
      organizationId: 'fgl',
      name: 'Hyzer Heros',
      malePlayerId: 'gannon-buhr',
      femalePlayerId: 'kristin-latt'
    }),
    Team.create({
      id: 'midas-touch',
      organizationId: 'fgl',
      name: 'Midas Touch',
      malePlayerId: 'matthew-orum',
      femalePlayerId: 'ella-hansen'
    })
  ]),
  tournaments: new InMemoryTournamentRepository([
    Tournament.create({
      id: 'tournament-1',
      organizationId: 'fgl',
      seasonId: 'season-1',
      name: 'Spring Open',
      capacity: 32,
      courseId: 'course-1'
    }),
    Tournament.create({
      id: 'tournament-2',
      organizationId: 'fgl',
      seasonId: 'season-1',
      name: 'Summer Championship',
      capacity: 16,
      courseId: 'course-2'
    }),
    Tournament.create({
      id: 'tournament-3',
      organizationId: 'org-2',
      seasonId: 'season-2',
      name: 'Course Community Cup',
      capacity: 24,
      courseId: 'course-3'
    })
  ]),
  courses: new InMemoryCourseRepository([
    Course.create({
      id: 'course-1',
      organizationId: 'fgl',
      name: 'Maple Ridge',
      holeCount: 18
    }),
    Course.create({
      id: 'course-2',
      organizationId: 'fgl',
      name: 'Harbor Point',
      holeCount: 18
    }),
    Course.create({
      id: 'course-3',
      organizationId: 'org-2',
      name: 'Campus Greens',
      holeCount: 9
    })
  ]),
  holes: new InMemoryHoleRepository(
    [
      { courseId: 'course-1', count: 18 },
      { courseId: 'course-2', count: 18 },
      { courseId: 'course-3', count: 9 }
    ].flatMap(({ courseId, count }) =>
      Array.from({ length: count }, (_, index) =>
        Hole.create({
          id: `${courseId}-hole-${(index + 1).toString()}`,
          courseId,
          number: index + 1,
          par: (index % 3) + 3
        })
      )
    )
  ),
  registrations: new InMemoryTournamentRegistrationRepository()
});

export const createFantasyRepositories = () => ({
  leagues: new InMemoryFantasyLeagueRepository([
    FantasyLeague.create({
      id: 'fantasy-league-1',
      organizationId: 'fgl',
      name: 'FLI Golf Fantasy',
      participantIds: ['simon-lizotte', 'kat-mertsch']
    })
  ]),
  teams: new InMemoryFantasyTeamRepository([
    FantasyTeam.create({
      id: 'fantasy-team-1',
      fantasyLeagueId: 'fantasy-league-1',
      ownerId: 'simon-lizotte',
      name: "Simon's Aces",
      playerIds: ['isaac-robinson', 'missy-gannon']
    })
  ]),
  drafts: new InMemoryDraftRoomRepository()
});
