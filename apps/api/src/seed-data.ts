import { Organization } from '@flihub/core';
import {
  FantasyLeague,
  FantasyLeagueMembership,
  FantasyTeam,
  FantasyTournament,
  MAX_FANTASY_PARTICIPANTS,
  InMemoryDraftRoomRepository,
  InMemoryFantasyLeagueMembershipRepository,
  InMemoryFantasyLeagueRepository,
  InMemoryFantasyTeamRepository,
  InMemoryFantasyTournamentRepository
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
  InMemoryLeagueRepository,
  InMemoryPlayerRepository,
  InMemorySeasonRepository,
  InMemoryTeamRepository,
  InMemoryTournamentRegistrationRepository,
  InMemoryTournamentTeeGroupRepository,
  InMemoryTournamentRepository,
  League,
  Player,
  Season,
  Team,
  Tournament,
  TournamentRegistration,
  TournamentTeeGroup
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
  leagues: new InMemoryLeagueRepository([
    League.create({
      id: 'fgl-league',
      organizationId: 'fgl',
      name: 'FLI Golf League',
      format: 'fli-golf-standard',
      paysTeams: true
    }),
    League.create({
      id: 'example-school-league',
      organizationId: 'org-2',
      name: 'Example School League'
    })
  ]),
  seasons: new InMemorySeasonRepository([
    Season.create({
      id: 'summer-season',
      leagueId: 'fgl-league',
      name: 'Summer Season',
      brand: 'FLI Golf League',
      startsOn: new Date('2026-05-01T00:00:00.000Z'),
      endsOn: new Date('2026-08-31T23:59:59.999Z'),
      yearlyPurseMinorUnits: 400_000_000,
      status: 'current'
    }),
    Season.create({
      id: 'summer-2-season',
      leagueId: 'fgl-league',
      name: 'Summer 2 Season',
      brand: 'FLI Golf League',
      startsOn: new Date('2027-06-01T00:00:00.000Z'),
      endsOn: new Date('2027-08-31T23:59:59.999Z'),
      yearlyPurseMinorUnits: 800_000_000,
      status: 'upcoming'
    }),
    Season.create({
      id: 'example-school-season',
      leagueId: 'example-school-league',
      name: 'School Season',
      startsOn: new Date('2026-09-01T00:00:00.000Z'),
      endsOn: new Date('2026-11-30T23:59:59.999Z')
    })
  ]),
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
      brand: 'Ace Makers',
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
      id: 'sunset-open',
      organizationId: 'fgl',
      seasonId: 'summer-season',
      name: 'Sunset Open',
      type: 'fli',
      scheduledOn: new Date('2026-06-02T22:00:00.000Z'),
      courseId: 'course-1'
    }),
    Tournament.create({
      id: 'summer-championship',
      organizationId: 'fgl',
      seasonId: 'summer-season',
      name: 'Summer Championship',
      type: 'fli',
      scheduledOn: new Date('2026-08-11T22:00:00.000Z'),
      courseId: 'course-2'
    }),
    Tournament.create({
      id: 'canyon-heat-cup',
      organizationId: 'fgl',
      seasonId: 'summer-2-season',
      name: 'Canyon Heat Cup',
      type: 'fli',
      scheduledOn: new Date('2027-06-16T22:00:00.000Z'),
      courseId: 'course-1'
    }),
    Tournament.create({
      id: 'summer-solstice-invitational',
      organizationId: 'fgl',
      seasonId: 'summer-2-season',
      name: 'Summer Solstice Invitational',
      type: 'fli',
      scheduledOn: new Date('2027-06-30T22:00:00.000Z'),
      courseId: 'course-2'
    }),
    Tournament.create({
      id: 'high-desert-classic',
      organizationId: 'fgl',
      seasonId: 'summer-2-season',
      name: 'High Desert Classic',
      type: 'fli',
      scheduledOn: new Date('2027-07-14T22:00:00.000Z'),
      courseId: 'course-1'
    }),
    Tournament.create({
      id: 'mesa-flight-showdown',
      organizationId: 'fgl',
      seasonId: 'summer-2-season',
      name: 'Mesa Flight Showdown',
      type: 'fli',
      scheduledOn: new Date('2027-07-28T22:00:00.000Z'),
      courseId: 'course-2'
    }),
    Tournament.create({
      id: 'course-community-cup',
      organizationId: 'org-2',
      seasonId: 'example-school-season',
      name: 'Course Community Cup',
      type: 'multi-round',
      scheduledOn: new Date('2026-10-15T22:00:00.000Z'),
      courseId: 'course-1'
    })
  ]),
  courses: new InMemoryCourseRepository([
    Course.create({
      id: 'course-1',
      organizationId: 'fgl',
      name: 'Turf Paradise',
      holeCount: 9
    }),
    Course.create({
      id: 'course-2',
      organizationId: 'fgl',
      name: 'Arizona Athletic Grounds',
      holeCount: 9
    })
  ]),
  holes: new InMemoryHoleRepository(
    [
      {
        courseId: 'course-1',
        name: 'Turf Paradise',
        distances: [215, 245, 280, 260, 300, 340, 270, 320, 415, 220, 250, 290, 270, 310, 350, 280, 330, 420]
      },
      {
        courseId: 'course-2',
        name: 'Arizona Athletic Grounds',
        distances: [225, 250, 285, 265, 305, 345, 275, 325, 410, 230, 255, 295, 275, 315, 355, 285, 335, 425]
      }
    ].flatMap(({ courseId, name, distances }) =>
      distances.map((distanceFeet, index) =>
        Hole.create({
          id: `${courseId}-hole-${(index + 1).toString()}`,
          courseId,
          number: index + 1,
          par: 3,
          name: `${name} Hole ${index + 1}`,
          distanceFeet,
          blueBasket: index < 9
        })
      )
    )
  ),
  teeGroups: new InMemoryTournamentTeeGroupRepository([
    TournamentTeeGroup.create({
      id: 'sunset-open-group-1',
      tournamentId: 'sunset-open',
      number: 1,
      teeTime: '3:00 PM PST',
      teamIds: ['ace-makers', 'midas-touch']
    }),
    TournamentTeeGroup.create({
      id: 'sunset-open-group-2',
      tournamentId: 'sunset-open',
      number: 2,
      teeTime: '3:10 PM PST',
      teamIds: ['birdie-storm', 'hyzer-heros']
    }),
    TournamentTeeGroup.create({
      id: 'sunset-open-group-3',
      tournamentId: 'sunset-open',
      number: 3,
      teeTime: '3:20 PM PST',
      teamIds: ['chain-breakers', 'huk-a-mania']
    }),
    TournamentTeeGroup.create({
      id: 'sunset-open-group-4',
      tournamentId: 'sunset-open',
      number: 4,
      teeTime: '3:30 PM PST',
      teamIds: ['chain-seekers', 'glide-masters']
    }),
    TournamentTeeGroup.create({
      id: 'sunset-open-group-5',
      tournamentId: 'sunset-open',
      number: 5,
      teeTime: '3:40 PM PST',
      teamIds: ['disc-dynasty', 'flight-squad']
    }),
    TournamentTeeGroup.create({
      id: 'sunset-open-group-6',
      tournamentId: 'sunset-open',
      number: 6,
      teeTime: '3:50 PM PST',
      teamIds: ['disc-jesters', 'fairway-bombers']
    })
  ]),
  registrations: new InMemoryTournamentRegistrationRepository([
    TournamentRegistration.create({
      tournamentId: 'sunset-open',
      playerId: 'simon-lizotte',
      registeredAt: new Date('2026-05-02T10:00:00.000Z')
    }),
    TournamentRegistration.create({
      tournamentId: 'sunset-open',
      playerId: 'kat-mertsch',
      registeredAt: new Date('2026-05-02T10:15:00.000Z')
    }),
    TournamentRegistration.create({
      tournamentId: 'sunset-open',
      playerId: 'isaac-robinson',
      registeredAt: new Date('2026-05-02T10:30:00.000Z')
    }),
    TournamentRegistration.create({
      tournamentId: 'sunset-open',
      playerId: 'missy-gannon',
      registeredAt: new Date('2026-05-02T10:45:00.000Z')
    }),
    TournamentRegistration.create({
      tournamentId: 'sunset-open',
      playerId: 'paul-mcbeth',
      registeredAt: new Date('2026-05-02T11:00:00.000Z')
    }),
    TournamentRegistration.create({
      tournamentId: 'sunset-open',
      playerId: 'holyn-handley',
      registeredAt: new Date('2026-05-02T11:15:00.000Z')
    }),
    TournamentRegistration.create({
      tournamentId: 'summer-championship',
      playerId: 'anthony-barela',
      registeredAt: new Date('2026-06-04T09:00:00.000Z')
    }),
    TournamentRegistration.create({
      tournamentId: 'summer-championship',
      playerId: 'hailey-king',
      registeredAt: new Date('2026-06-04T09:20:00.000Z')
    }),
    TournamentRegistration.create({
      tournamentId: 'summer-championship',
      playerId: 'chris-dickerson',
      registeredAt: new Date('2026-06-04T09:40:00.000Z')
    }),
    TournamentRegistration.create({
      tournamentId: 'summer-championship',
      playerId: 'paige-pierce',
      registeredAt: new Date('2026-06-04T10:00:00.000Z')
    }),
    TournamentRegistration.create({
      tournamentId: 'summer-championship',
      playerId: 'kyle-klein',
      registeredAt: new Date('2026-06-04T10:20:00.000Z')
    }),
    TournamentRegistration.create({
      tournamentId: 'summer-championship',
      playerId: 'silva-saarinen',
      registeredAt: new Date('2026-06-04T10:40:00.000Z')
    })
  ])
});

export const createFantasyRepositories = () => ({
  leagues: new InMemoryFantasyLeagueRepository([
    FantasyLeague.create({
      id: 'fantasy-league-1',
      organizationId: 'fgl',
      name: 'FLI Golf Fantasy',
      ownerUserId: 'simon-lizotte',
      requiredApprovedParticipants: 2,
      maxParticipants: MAX_FANTASY_PARTICIPANTS,
      participantIds: ['simon-lizotte', 'kat-mertsch'],
      status: 'open'
    })
  ]),
  memberships: new InMemoryFantasyLeagueMembershipRepository([
    FantasyLeagueMembership.create({
      id: 'membership-1',
      leagueId: 'fantasy-league-1',
      userId: 'simon-lizotte',
      role: 'owner',
      state: 'approved',
      requestedAt: '2026-01-01T00:00:00.000Z',
      reviewedAt: '2026-01-01T00:00:00.000Z',
      reviewedByUserId: 'simon-lizotte',
      note: 'League owner'
    }),
    FantasyLeagueMembership.create({
      id: 'membership-2',
      leagueId: 'fantasy-league-1',
      userId: 'kat-mertsch',
      role: 'participant',
      state: 'approved',
      requestedAt: '2026-01-02T00:00:00.000Z',
      reviewedAt: '2026-01-02T00:00:00.000Z',
      reviewedByUserId: 'simon-lizotte',
      note: 'Approved by owner'
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
  tournaments: new InMemoryFantasyTournamentRepository([
    FantasyTournament.create({
      id: 'fantasy-tournament-1',
      leagueId: 'fantasy-league-1',
      seasonId: 'summer-season',
      tournamentNumber: 1,
      name: 'Fantasy Round 1',
      status: 'draft_pending',
      participantIds: ['simon-lizotte', 'kat-mertsch'],
      scheduledAt: '2026-06-02T22:00:00.000Z'
    })
  ]),
  drafts: new InMemoryDraftRoomRepository()
});
