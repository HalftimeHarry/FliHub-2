import express, { type Request, type Response } from 'express';
import { Identifier } from '@flihub/core';
import { createSubmitReimbursementClaimWorkflow } from '@flihub/business';
import {
  Course,
  Hole,
  MAX_TEAMS_PER_LEAGUE,
  Team,
  Tournament,
  createTournamentRegistrationWorkflow,
  type TournamentStatus
} from '@flihub/league';
import {
  DraftRoom,
  FantasyLeague,
  FantasyTeam,
  MAX_FANTASY_PARTICIPANTS,
  MAX_FANTASY_ROSTER_SIZE
} from '@flihub/fantasy';
import { mockUsers } from './mock-users.js';
import {
  createOrganizationContextMiddleware,
  requirePermission,
  type OrganizationRequest
} from './organization-context.js';
import {
  createBusinessRepositories,
  createFantasyRepositories,
  createLeagueRepositories,
  findOrganization,
  seedDefaultOrganizations
} from './seed-data.js';

const app = express();
app.use(express.json());
app.use(
  ['/business', '/league', '/fantasy'],
  createOrganizationContextMiddleware(mockUsers)
);

const businessRepositories = createBusinessRepositories();
const leagueRepositories = createLeagueRepositories();
const fantasyRepositories = createFantasyRepositories();

const submitReimbursementClaim =
  createSubmitReimbursementClaimWorkflow(businessRepositories);
const registerPlayerForTournament =
  createTournamentRegistrationWorkflow(leagueRepositories);

app.get('/', (_req, res) => {
  res.json({
    name: 'FLIHub API',
    endpoints: [
      'GET /health',
      'GET /users',
      'GET /organization/users',
      'GET /organization',
      'POST /organization/seed',
      'GET /business/departments',
      'GET /business/projects',
      'GET /business/reimbursement-claims',
      'POST /business/reimbursement-claims',
      'GET /league/players',
      'GET /league/teams',
      'POST /league/teams',
      'GET /league/tournaments',
      'POST /league/tournaments',
      'GET /league/courses',
      'POST /league/courses',
      'GET /league/holes',
      'POST /league/holes',
      'POST /league/seed',
      'GET /league/tournament-registrations',
      'POST /league/tournament-registrations',
      'GET /fantasy/leagues',
      'POST /fantasy/leagues',
      'GET /fantasy/teams',
      'POST /fantasy/teams',
      'POST /fantasy/seed',
      'GET /fantasy/drafts',
      'POST /fantasy/drafts',
      'GET /fantasy/drafts/:id',
      'POST /fantasy/drafts/:id/open',
      'POST /fantasy/drafts/:id/pick'
    ]
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/users', (_req, res) => {
  res.json(mockUsers);
});

app.get(
  '/organization/users',
  createOrganizationContextMiddleware(mockUsers),
  (req: OrganizationRequest, res) => {
    res.json(
      mockUsers.filter((user) => user.organizationId === req.organizationId)
    );
  }
);

app.get(
  '/organization',
  createOrganizationContextMiddleware(mockUsers),
  (req: OrganizationRequest, res) => {
    const organization = findOrganization(req.organizationId);

    if (organization === undefined) {
      res.status(404).json({
        code: 'organization.not_found',
        message: 'Organization could not be resolved.'
      });
      return;
    }

    res.json({
      id: organization.id.value,
      name: organization.name,
      type: organization.type,
      paysTeams: organization.paysTeams,
      enabledComponents: organization.enabledComponents
    });
  }
);

app.post(
  '/organization/seed',
  createOrganizationContextMiddleware(mockUsers),
  (_req: OrganizationRequest, res) => {
    res.status(201).json(
      seedDefaultOrganizations().map((organization) => ({
        id: organization.id.value,
        name: organization.name,
        type: organization.type,
        paysTeams: organization.paysTeams,
        enabledComponents: organization.enabledComponents
      }))
    );
  }
);

app.get('/business/departments', (req: OrganizationRequest, res) => {
  void businessRepositories.departments.list().then((departments) => {
    res.json(
      departments
        .filter(
          (department) => department.organizationId.value === req.organizationId
        )
        .map((department) => ({
          id: department.id.value,
          organizationId: department.organizationId.value,
          name: department.name
        }))
    );
  });
});

app.get('/business/projects', (req: OrganizationRequest, res) => {
  void Promise.all([
    businessRepositories.departments.list(),
    businessRepositories.projects.list()
  ]).then(([departments, projects]) => {
    const departmentIds = new Set(
      departments
        .filter(
          (department) => department.organizationId.value === req.organizationId
        )
        .map((department) => department.id.value)
    );
    res.json(
      projects
        .filter((project) => departmentIds.has(project.departmentId.value))
        .map((project) => ({
          id: project.id.value,
          departmentId: project.departmentId.value,
          name: project.name
        }))
    );
  });
});

app.get('/business/reimbursement-claims', (req: OrganizationRequest, res) => {
  void Promise.all([
    businessRepositories.departments.list(),
    businessRepositories.claims.list()
  ]).then(([departments, claims]) => {
    const departmentIds = new Set(
      departments
        .filter(
          (department) => department.organizationId.value === req.organizationId
        )
        .map((department) => department.id.value)
    );
    res.json(
      claims
        .filter((claim) => departmentIds.has(claim.departmentId.value))
        .map((claim) => ({
          id: claim.id.value,
          claimantId: claim.claimantId.value,
          departmentId: claim.departmentId.value,
          projectId: claim.projectId?.value,
          totalMinorUnits: claim.total.minorUnits,
          currency: claim.total.currency,
          status: claim.status
        }))
    );
  });
});

app.get('/league/players', (req: OrganizationRequest, res) => {
  void leagueRepositories.players.list().then((players) => {
    res.json(
      players
        .filter((player) => player.organizationId.value === req.organizationId)
        .map((player) => ({
          id: player.id.value,
          organizationId: player.organizationId.value,
          displayName: player.displayName,
          active: player.active,
          playerType: player.playerType,
          gender: player.gender,
          schoolId: player.schoolId?.value,
          professionalSince: player.professionalSince?.toISOString()
        }))
    );
  });
});

app.get('/league/teams', (req: OrganizationRequest, res) => {
  void leagueRepositories.teams.list().then((teams) => {
    res.json(
      teams
        .filter((team) => team.organizationId.value === req.organizationId)
        .map((team) => ({
          id: team.id.value,
          organizationId: team.organizationId.value,
          name: team.name,
          malePlayerId: team.malePlayerId.value,
          femalePlayerId: team.femalePlayerId.value
        }))
    );
  });
});

app.post(
  '/league/teams',
  requirePermission('league', 'write'),
  (req: OrganizationRequest, res) => {
    const body = req.body as {
      name?: string;
      malePlayerId?: string;
      femalePlayerId?: string;
    };

    if (body.malePlayerId === undefined || body.femalePlayerId === undefined) {
      res.status(400).json({
        code: 'league.team.players_required',
        message: 'Both a malePlayerId and a femalePlayerId are required.'
      });
      return;
    }

    const malePlayerId = body.malePlayerId;
    const femalePlayerId = body.femalePlayerId;

    void Promise.all([
      leagueRepositories.teams.list(),
      leagueRepositories.players.list()
    ]).then(async ([teams, players]) => {
      const organizationTeams = teams.filter(
        (team) => team.organizationId.value === req.organizationId
      );

      if (organizationTeams.length >= MAX_TEAMS_PER_LEAGUE) {
        res.status(400).json({
          code: 'league.team.limit_reached',
          message: `A league cannot contain more than ${MAX_TEAMS_PER_LEAGUE.toString()} teams.`
        });
        return;
      }

      const byId = new Map(players.map((player) => [player.id.value, player]));
      const male = byId.get(malePlayerId);
      const female = byId.get(femalePlayerId);

      if (male === undefined || female === undefined) {
        res.status(400).json({
          code: 'league.team.player_not_found',
          message: 'Both team players must exist.'
        });
        return;
      }

      if (
        male.organizationId.value !== req.organizationId ||
        female.organizationId.value !== req.organizationId
      ) {
        res.status(400).json({
          code: 'league.team.organization_mismatch',
          message: 'Team players must belong to the requested organization.'
        });
        return;
      }

      if (male.gender !== 'male' || female.gender !== 'female') {
        res.status(400).json({
          code: 'league.team.invalid_pairing',
          message:
            'A team must include exactly one male and one female player.'
        });
        return;
      }

      const existingIds = new Set(teams.map((team) => team.id.value));
      let index = teams.length + 1;
      let id = `team-${index.toString()}`;
      while (existingIds.has(id)) {
        index += 1;
        id = `team-${index.toString()}`;
      }

      const team = Team.create({
        id,
        organizationId: req.organizationId,
        name: body.name ?? '',
        malePlayerId,
        femalePlayerId
      });

      await leagueRepositories.teams.save(team);
      res.status(201).json({
        id: team.id.value,
        organizationId: team.organizationId.value,
        name: team.name,
        malePlayerId: team.malePlayerId.value,
        femalePlayerId: team.femalePlayerId.value
      });
    });
  }
);

app.get('/league/tournaments', (req: OrganizationRequest, res) => {
  void leagueRepositories.tournaments.list().then((tournaments) => {
    res.json(
      tournaments
        .filter(
          (tournament) => tournament.organizationId.value === req.organizationId
        )
        .map((tournament) => ({
          id: tournament.id.value,
          organizationId: tournament.organizationId.value,
          seasonId: tournament.seasonId.value,
          name: tournament.name,
          capacity: tournament.capacity,
          status: tournament.status,
          courseId: tournament.courseId?.value
        }))
    );
  });
});

app.get('/league/courses', (req: OrganizationRequest, res) => {
  void leagueRepositories.courses.list().then((courses) => {
    res.json(
      courses
        .filter((course) => course.organizationId.value === req.organizationId)
        .map((course) => ({
          id: course.id.value,
          organizationId: course.organizationId.value,
          name: course.name,
          holeCount: course.holeCount
        }))
    );
  });
});

app.get('/league/holes', (req: OrganizationRequest, res) => {
  void Promise.all([
    leagueRepositories.courses.list(),
    leagueRepositories.holes.list()
  ]).then(([courses, holes]) => {
    const courseIds = new Set(
      courses
        .filter((course) => course.organizationId.value === req.organizationId)
        .map((course) => course.id.value)
    );
    res.json(
      holes
        .filter((hole) => courseIds.has(hole.courseId.value))
        .sort((left, right) => left.number - right.number)
        .map((hole) => ({
          id: hole.id.value,
          courseId: hole.courseId.value,
          number: hole.number,
          par: hole.par
        }))
    );
  });
});

app.post(
  '/league/tournaments',
  requirePermission('league', 'write'),
  (req: OrganizationRequest, res) => {
    const body = req.body as {
      name?: string;
      capacity?: number;
      courseId?: string;
      status?: TournamentStatus;
    };

    void leagueRepositories.tournaments.list().then((tournaments) => {
      const existingIds = new Set(
        tournaments.map((tournament) => tournament.id.value)
      );
      let index = tournaments.length + 1;
      let id = `tournament-${index.toString()}`;
      while (existingIds.has(id)) {
        index += 1;
        id = `tournament-${index.toString()}`;
      }

      const tournament = Tournament.create({
        id,
        organizationId: req.organizationId,
        seasonId: 'season-1',
        name: body.name ?? '',
        capacity: body.capacity ?? 32,
        status: body.status,
        courseId: body.courseId
      });

      void leagueRepositories.tournaments.save(tournament).then(() => {
        res.status(201).json({
          id: tournament.id.value,
          organizationId: tournament.organizationId.value,
          seasonId: tournament.seasonId.value,
          name: tournament.name,
          capacity: tournament.capacity,
          status: tournament.status,
          courseId: tournament.courseId?.value
        });
      });
    });
  }
);

app.post(
  '/league/courses',
  requirePermission('league', 'write'),
  (req: OrganizationRequest, res) => {
    const body = req.body as { name?: string; holeCount?: number };

    void leagueRepositories.courses.list().then((courses) => {
      const existingIds = new Set(courses.map((course) => course.id.value));
      let index = courses.length + 1;
      let id = `course-${index.toString()}`;
      while (existingIds.has(id)) {
        index += 1;
        id = `course-${index.toString()}`;
      }

      const course = Course.create({
        id,
        organizationId: req.organizationId,
        name: body.name ?? '',
        holeCount: body.holeCount ?? 18
      });

      void leagueRepositories.courses.save(course).then(() => {
        res.status(201).json({
          id: course.id.value,
          organizationId: course.organizationId.value,
          name: course.name,
          holeCount: course.holeCount
        });
      });
    });
  }
);

app.post(
  '/league/holes',
  requirePermission('league', 'write'),
  (req: OrganizationRequest, res) => {
    const body = req.body as {
      courseId?: string;
      number?: number;
      par?: number;
    };

    if (body.courseId === undefined) {
      res.status(400).json({
        code: 'league.hole.course_required',
        message: 'A courseId is required to add a hole.'
      });
      return;
    }

    const courseId = body.courseId;

    void leagueRepositories.holes.list().then((holes) => {
      const number = body.number ?? holes.length + 1;
      const hole = Hole.create({
        id: `${courseId}-hole-${number.toString()}`,
        courseId,
        number,
        par: body.par ?? 3
      });

      void leagueRepositories.holes.save(hole).then(() => {
        res.status(201).json({
          id: hole.id.value,
          courseId: hole.courseId.value,
          number: hole.number,
          par: hole.par
        });
      });
    });
  }
);

app.post(
  '/league/seed',
  requirePermission('league', 'write'),
  (req: OrganizationRequest, res) => {
    const body = req.body as {
      tournaments?: number;
      courses?: number;
      holesPerCourse?: number;
      tournamentCapacity?: number;
      teams?: number;
    };

    const organizationId = req.organizationId;
    const tournamentCount = Math.max(0, body.tournaments ?? 0);
    const courseCount = Math.max(0, body.courses ?? 0);
    const holesPerCourse = Math.max(1, body.holesPerCourse ?? 18);
    const tournamentCapacity = Math.max(1, body.tournamentCapacity ?? 32);
    const teamCount = Math.max(0, body.teams ?? 0);

    void Promise.all([
      leagueRepositories.tournaments.list(),
      leagueRepositories.courses.list(),
      leagueRepositories.holes.list(),
      leagueRepositories.teams.list(),
      leagueRepositories.players.list()
    ]).then(async ([tournaments, courses, holes, teams, players]) => {
      const courseIds = new Set(courses.map((course) => course.id.value));
      const createdCourses: Course[] = [];

      let courseIndex = courses.length + 1;
      for (let i = 0; i < courseCount; i += 1) {
        let id = `course-${courseIndex.toString()}`;
        while (courseIds.has(id)) {
          courseIndex += 1;
          id = `course-${courseIndex.toString()}`;
        }
        courseIndex += 1;
        const course = Course.create({
          id,
          organizationId,
          name: `Course ${id.split('-').pop() ?? id}`,
          holeCount: holesPerCourse
        });
        courseIds.add(id);
        createdCourses.push(course);
        await leagueRepositories.courses.save(course);
      }

      const holeIds = new Set(holes.map((hole) => hole.id.value));
      const createdHoles: Hole[] = [];
      for (const course of createdCourses) {
        for (let number = 1; number <= holesPerCourse; number += 1) {
          const holeId = `${course.id.value}-hole-${number.toString()}`;
          if (holeIds.has(holeId)) {
            continue;
          }
          holeIds.add(holeId);
          const hole = Hole.create({
            id: holeId,
            courseId: course.id.value,
            number,
            par: ((number - 1) % 3) + 3
          });
          createdHoles.push(hole);
          await leagueRepositories.holes.save(hole);
        }
      }

      const tournamentIds = new Set(
        tournaments.map((tournament) => tournament.id.value)
      );
      const createdTournaments: Tournament[] = [];
      const allCourseIds = [
        ...courses.map((course) => course.id.value),
        ...createdCourses.map((course) => course.id.value)
      ];

      let tournamentIndex = tournaments.length + 1;
      for (let i = 0; i < tournamentCount; i += 1) {
        let id = `tournament-${tournamentIndex.toString()}`;
        while (tournamentIds.has(id)) {
          tournamentIndex += 1;
          id = `tournament-${tournamentIndex.toString()}`;
        }
        tournamentIndex += 1;
        const tournament = Tournament.create({
          id,
          organizationId,
          seasonId: 'season-1',
          name: `Tournament ${id.split('-').pop() ?? id}`,
          capacity: tournamentCapacity,
          status: 'scheduled',
          courseId: allCourseIds.length
            ? allCourseIds[i % allCourseIds.length]
            : undefined
        });
        tournamentIds.add(id);
        createdTournaments.push(tournament);
        await leagueRepositories.tournaments.save(tournament);
      }

      // Seed teams by pairing available male + female players from the org.
      const organizationTeams = teams.filter(
        (team) => team.organizationId.value === organizationId
      );
      const teamIds = new Set(teams.map((team) => team.id.value));
      const pairedPlayerIds = new Set(
        organizationTeams.flatMap((team) => [
          team.malePlayerId.value,
          team.femalePlayerId.value
        ])
      );
      const orgPlayers = players.filter(
        (player) =>
          player.organizationId.value === organizationId && player.active
      );
      const availableMale = orgPlayers.filter(
        (player) => player.gender === 'male' && !pairedPlayerIds.has(player.id.value)
      );
      const availableFemale = orgPlayers.filter(
        (player) =>
          player.gender === 'female' && !pairedPlayerIds.has(player.id.value)
      );

      const createdTeams: Team[] = [];
      const capacity = MAX_TEAMS_PER_LEAGUE - organizationTeams.length;
      const pairable = Math.min(
        teamCount,
        capacity,
        availableMale.length,
        availableFemale.length
      );

      let teamIndex = teams.length + 1;
      for (let i = 0; i < pairable; i += 1) {
        let id = `team-${teamIndex.toString()}`;
        while (teamIds.has(id)) {
          teamIndex += 1;
          id = `team-${teamIndex.toString()}`;
        }
        teamIndex += 1;
        const male = availableMale[i];
        const female = availableFemale[i];
        const team = Team.create({
          id,
          organizationId,
          name: `${male.displayName} & ${female.displayName}`,
          malePlayerId: male.id.value,
          femalePlayerId: female.id.value
        });
        teamIds.add(id);
        createdTeams.push(team);
        await leagueRepositories.teams.save(team);
      }

      res.status(201).json({
        organizationId,
        created: {
          tournaments: createdTournaments.map((tournament) => tournament.id.value),
          courses: createdCourses.map((course) => course.id.value),
          holes: createdHoles.length,
          teams: createdTeams.map((team) => team.id.value)
        }
      });
    });
  }
);

app.get('/fantasy/leagues', (req: OrganizationRequest, res) => {
  void fantasyRepositories.leagues.list().then((leagues) => {
    res.json(
      leagues
        .filter((league) => league.organizationId.value === req.organizationId)
        .map((league) => ({
          id: league.id.value,
          organizationId: league.organizationId.value,
          name: league.name,
          participantIds: league.participantIds.map((id) => id.value)
        }))
    );
  });
});

app.post(
  '/fantasy/leagues',
  requirePermission('fantasy', 'write'),
  (req: OrganizationRequest, res) => {
    const body = req.body as { name?: string; participantIds?: string[] };

    void fantasyRepositories.leagues.list().then((leagues) => {
      const existingIds = new Set(leagues.map((league) => league.id.value));
      let index = leagues.length + 1;
      let id = `fantasy-league-${index.toString()}`;
      while (existingIds.has(id)) {
        index += 1;
        id = `fantasy-league-${index.toString()}`;
      }

      const league = FantasyLeague.create({
        id,
        organizationId: req.organizationId,
        name: body.name ?? '',
        participantIds: body.participantIds ?? []
      });

      void fantasyRepositories.leagues.save(league).then(() => {
        res.status(201).json({
          id: league.id.value,
          organizationId: league.organizationId.value,
          name: league.name,
          participantIds: league.participantIds.map(
            (participantId) => participantId.value
          )
        });
      });
    });
  }
);

app.get('/fantasy/teams', (req: OrganizationRequest, res) => {
  void Promise.all([
    fantasyRepositories.leagues.list(),
    fantasyRepositories.teams.list()
  ]).then(([leagues, teams]) => {
    const leagueIds = new Set(
      leagues
        .filter((league) => league.organizationId.value === req.organizationId)
        .map((league) => league.id.value)
    );
    res.json(
      teams
        .filter((team) => leagueIds.has(team.fantasyLeagueId.value))
        .map((team) => ({
          id: team.id.value,
          fantasyLeagueId: team.fantasyLeagueId.value,
          ownerId: team.ownerId.value,
          name: team.name,
          playerIds: team.playerIds.map((playerId) => playerId.value)
        }))
    );
  });
});

app.post(
  '/fantasy/teams',
  requirePermission('fantasy', 'write'),
  (req: OrganizationRequest, res) => {
    const body = req.body as {
      fantasyLeagueId?: string;
      ownerId?: string;
      name?: string;
      playerIds?: string[];
    };

    if (body.fantasyLeagueId === undefined || body.ownerId === undefined) {
      res.status(400).json({
        code: 'fantasy.team.league_and_owner_required',
        message: 'Both a fantasyLeagueId and an ownerId are required.'
      });
      return;
    }

    const fantasyLeagueId = body.fantasyLeagueId;
    const ownerId = body.ownerId;

    void Promise.all([
      fantasyRepositories.leagues.list(),
      fantasyRepositories.teams.list()
    ]).then(async ([leagues, teams]) => {
      const league = leagues.find(
        (entry) => entry.id.value === fantasyLeagueId
      );

      if (league === undefined) {
        res.status(400).json({
          code: 'fantasy.team.league_not_found',
          message: 'The fantasy league could not be resolved.'
        });
        return;
      }

      if (league.organizationId.value !== req.organizationId) {
        res.status(400).json({
          code: 'fantasy.team.organization_mismatch',
          message: 'The fantasy league belongs to a different organization.'
        });
        return;
      }

      const leagueTeams = teams.filter(
        (team) => team.fantasyLeagueId.value === fantasyLeagueId
      );

      if (leagueTeams.some((team) => team.ownerId.value === ownerId)) {
        res.status(400).json({
          code: 'fantasy.team.owner_has_team',
          message: 'This participant already owns a team in the league.'
        });
        return;
      }

      const playerIds = body.playerIds ?? [];
      if (playerIds.length > MAX_FANTASY_ROSTER_SIZE) {
        res.status(400).json({
          code: 'fantasy.team.roster_too_large',
          message: `A fantasy team cannot have more than ${MAX_FANTASY_ROSTER_SIZE.toString()} players.`
        });
        return;
      }

      const existingIds = new Set(teams.map((team) => team.id.value));
      let index = teams.length + 1;
      let id = `fantasy-team-${index.toString()}`;
      while (existingIds.has(id)) {
        index += 1;
        id = `fantasy-team-${index.toString()}`;
      }

      const team = FantasyTeam.create({
        id,
        fantasyLeagueId,
        ownerId,
        name: body.name ?? '',
        playerIds
      });

      await fantasyRepositories.teams.save(team);
      res.status(201).json({
        id: team.id.value,
        fantasyLeagueId: team.fantasyLeagueId.value,
        ownerId: team.ownerId.value,
        name: team.name,
        playerIds: team.playerIds.map((playerId) => playerId.value)
      });
    });
  }
);

app.post(
  '/fantasy/seed',
  requirePermission('fantasy', 'write'),
  (req: OrganizationRequest, res) => {
    const body = req.body as { leagues?: number; teamsPerLeague?: number };
    const organizationId = req.organizationId;
    const leagueCount = Math.max(0, body.leagues ?? 1);
    const teamsPerLeague = Math.max(
      1,
      Math.min(MAX_FANTASY_PARTICIPANTS, body.teamsPerLeague ?? 2)
    );

    void Promise.all([
      fantasyRepositories.leagues.list(),
      fantasyRepositories.teams.list(),
      leagueRepositories.players.list()
    ]).then(async ([leagues, teams, players]) => {
      const orgPlayers = players.filter(
        (player) =>
          player.organizationId.value === organizationId && player.active
      );

      const leagueIds = new Set(leagues.map((league) => league.id.value));
      const teamIds = new Set(teams.map((team) => team.id.value));
      const createdLeagues: FantasyLeague[] = [];
      const createdTeams: FantasyTeam[] = [];

      let leagueIndex = leagues.length + 1;
      let teamIndex = teams.length + 1;

      for (let i = 0; i < leagueCount; i += 1) {
        let leagueId = `fantasy-league-${leagueIndex.toString()}`;
        while (leagueIds.has(leagueId)) {
          leagueIndex += 1;
          leagueId = `fantasy-league-${leagueIndex.toString()}`;
        }
        leagueIndex += 1;

        const participantIds = orgPlayers
          .slice(0, MAX_FANTASY_PARTICIPANTS)
          .map((player) => player.id.value);

        const league = FantasyLeague.create({
          id: leagueId,
          organizationId,
          name: `Fantasy League ${leagueId.split('-').pop() ?? leagueId}`,
          participantIds
        });
        leagueIds.add(leagueId);
        createdLeagues.push(league);
        await fantasyRepositories.leagues.save(league);

        const owners = participantIds.slice(0, teamsPerLeague);
        for (const owner of owners) {
          let teamId = `fantasy-team-${teamIndex.toString()}`;
          while (teamIds.has(teamId)) {
            teamIndex += 1;
            teamId = `fantasy-team-${teamIndex.toString()}`;
          }
          teamIndex += 1;

          const team = FantasyTeam.create({
            id: teamId,
            fantasyLeagueId: leagueId,
            ownerId: owner,
            name: `Team ${owner}`,
            playerIds: participantIds.filter((id) => id !== owner).slice(0, 6)
          });
          teamIds.add(teamId);
          createdTeams.push(team);
          await fantasyRepositories.teams.save(team);
        }
      }

      res.status(201).json({
        organizationId,
        created: {
          leagues: createdLeagues.map((league) => league.id.value),
          teams: createdTeams.map((team) => team.id.value)
        }
      });
    });
  }
);

const serializeDraft = (draft: DraftRoom) => {
  const onTheClock = draft.getParticipantOnTheClock();
  const next = draft.getNextParticipant();
  return {
    id: draft.id.value,
    fantasyLeagueId: draft.fantasyLeagueId.value,
    organizationId: draft.organizationId.value,
    status: draft.getStatus(),
    locked: draft.isLocked(),
    currentRound: draft.getCurrentRound(),
    rounds: draft.rounds,
    maxPerGender: draft.maxPerGender,
    timerSeconds: draft.getTimerSeconds(),
    secondsRemaining: draft.getSecondsRemaining(),
    onTheClockParticipantId: onTheClock?.value,
    nextParticipantId: next?.value,
    order: draft.order.map((id) => id.value),
    pool: draft.pool.map((player) => ({
      id: player.id.value,
      gender: player.gender
    })),
    picks: draft.getPicks().map((pick) => ({
      participantId: pick.participantId.value,
      playerId: pick.playerId.value,
      round: pick.round,
      pickNumber: pick.pickNumber
    }))
  };
};

app.get('/fantasy/drafts', (req: OrganizationRequest, res) => {
  void fantasyRepositories.drafts.list().then((drafts) => {
    res.json(
      drafts
        .filter((draft) => draft.organizationId.value === req.organizationId)
        .map(serializeDraft)
    );
  });
});

app.post(
  '/fantasy/drafts',
  requirePermission('fantasy', 'write'),
  (req: OrganizationRequest, res) => {
    const body = req.body as {
      fantasyLeagueId?: string;
      participantIds?: string[];
      poolPlayerIds?: string[];
      timerSeconds?: number;
    };

    if (
      body.fantasyLeagueId === undefined ||
      body.participantIds === undefined ||
      body.poolPlayerIds === undefined
    ) {
      res.status(400).json({
        code: 'fantasy.draft.invalid_input',
        message:
          'fantasyLeagueId, participantIds, and poolPlayerIds are required.'
      });
      return;
    }

    const fantasyLeagueId = body.fantasyLeagueId;
    const participantIds = body.participantIds;
    const poolPlayerIds = body.poolPlayerIds;

    void Promise.all([
      fantasyRepositories.leagues.list(),
      fantasyRepositories.drafts.list(),
      leagueRepositories.players.list()
    ]).then(async ([leagues, drafts, players]) => {
      const league = leagues.find((entry) => entry.id.value === fantasyLeagueId);

      if (league === undefined) {
        res.status(400).json({
          code: 'fantasy.draft.league_not_found',
          message: 'The fantasy league could not be resolved.'
        });
        return;
      }

      if (league.organizationId.value !== req.organizationId) {
        res.status(400).json({
          code: 'fantasy.draft.organization_mismatch',
          message: 'The fantasy league belongs to a different organization.'
        });
        return;
      }

      const playersById = new Map(
        players.map((player) => [player.id.value, player])
      );
      const pool: { id: string; gender: 'male' | 'female' }[] = [];

      for (const playerId of poolPlayerIds) {
        const player = playersById.get(playerId);
        const notDraftable =
          player?.organizationId.value !== req.organizationId ||
          player.gender === undefined;

        if (notDraftable) {
          res.status(400).json({
            code: 'fantasy.draft.player_not_draftable',
            message: `Player ${playerId} is missing, out of organization, or has no gender set.`
          });
          return;
        }
        pool.push({ id: playerId, gender: player.gender });
      }

      const existingIds = new Set(drafts.map((draft) => draft.id.value));
      let index = drafts.length + 1;
      let id = `draft-${index.toString()}`;
      while (existingIds.has(id)) {
        index += 1;
        id = `draft-${index.toString()}`;
      }

      let draft: DraftRoom;
      try {
        draft = DraftRoom.create({
          id,
          fantasyLeagueId,
          organizationId: req.organizationId,
          order: participantIds,
          pool,
          ownerId: req.userId,
          timerSeconds: body.timerSeconds
        });
      } catch (caught) {
        res.status(400).json({
          code: 'fantasy.draft.invalid_configuration',
          message:
            caught instanceof Error ? caught.message : 'Invalid draft setup.'
        });
        return;
      }

      await fantasyRepositories.drafts.save(draft);
      res.status(201).json(serializeDraft(draft));
    });
  }
);

app.get('/fantasy/drafts/:id', (req: OrganizationRequest, res) => {
  void fantasyRepositories.drafts.list().then((drafts) => {
    const draft = drafts.find(
      (entry) =>
        entry.id.value === req.params.id &&
        entry.organizationId.value === req.organizationId
    );

    if (draft === undefined) {
      res.status(404).json({
        code: 'fantasy.draft.not_found',
        message: 'The draft could not be resolved.'
      });
      return;
    }

    res.json(serializeDraft(draft));
  });
});

app.post(
  '/fantasy/drafts/:id/open',
  requirePermission('fantasy', 'write'),
  (req: OrganizationRequest, res) => {
    void fantasyRepositories.drafts.list().then(async (drafts) => {
      const draft = drafts.find(
        (entry) =>
          entry.id.value === req.params.id &&
          entry.organizationId.value === req.organizationId
      );

      if (draft === undefined) {
        res.status(404).json({
          code: 'fantasy.draft.not_found',
          message: 'The draft could not be resolved.'
        });
        return;
      }

      try {
        draft.open(Identifier.create(req.userId, 'user id'));
      } catch (caught) {
        res.status(403).json({
          code: 'fantasy.draft.admin_required',
          message:
            caught instanceof Error ? caught.message : 'Admin access required.'
        });
        return;
      }

      await fantasyRepositories.drafts.save(draft);
      res.json(serializeDraft(draft));
    });
  }
);

app.post(
  '/fantasy/drafts/:id/pick',
  requirePermission('fantasy', 'write'),
  (req: OrganizationRequest, res) => {
    const body = req.body as { participantId?: string; playerId?: string };

    if (body.participantId === undefined || body.playerId === undefined) {
      res.status(400).json({
        code: 'fantasy.draft.pick_invalid_input',
        message: 'Both participantId and playerId are required.'
      });
      return;
    }

    const participantId = body.participantId;
    const playerId = body.playerId;

    void fantasyRepositories.drafts.list().then(async (drafts) => {
      const draft = drafts.find(
        (entry) =>
          entry.id.value === req.params.id &&
          entry.organizationId.value === req.organizationId
      );

      if (draft === undefined) {
        res.status(404).json({
          code: 'fantasy.draft.not_found',
          message: 'The draft could not be resolved.'
        });
        return;
      }

      try {
        draft.pick({ participantId, playerId });
      } catch (caught) {
        res.status(400).json({
          code: 'fantasy.draft.pick_rejected',
          message:
            caught instanceof Error ? caught.message : 'Pick was rejected.'
        });
        return;
      }

      await fantasyRepositories.drafts.save(draft);
      res.status(201).json(serializeDraft(draft));
    });
  }
);

app.get('/league/tournament-registrations', (req: OrganizationRequest, res) => {
  void Promise.all([
    leagueRepositories.players.list(),
    leagueRepositories.tournaments.list(),
    leagueRepositories.registrations.list()
  ]).then(([players, tournaments, registrations]) => {
    const playerIds = new Set(
      players
        .filter((player) => player.organizationId.value === req.organizationId)
        .map((player) => player.id.value)
    );
    const tournamentIds = new Set(
      tournaments
        .filter(
          (tournament) => tournament.organizationId.value === req.organizationId
        )
        .map((tournament) => tournament.id.value)
    );
    res.json(
      registrations
        .filter(
          (registration) =>
            playerIds.has(registration.playerId.value) &&
            tournamentIds.has(registration.tournamentId.value)
        )
        .map((registration) => ({
          id: registration.id.value,
          tournamentId: registration.tournamentId.value,
          playerId: registration.playerId.value,
          registeredAt: registration.registeredAt.toISOString()
        }))
    );
  });
});

const handleSubmitReimbursementClaim = async (req: Request, res: Response) => {
  const result = await submitReimbursementClaim.execute({
    ...(req.body as object),
    organizationId: (req as OrganizationRequest).organizationId
  } as Parameters<typeof submitReimbursementClaim.execute>[0]);

  if (!result.success) {
    res
      .status(400)
      .json({ code: result.error.code, message: result.error.message });
    return;
  }

  res.status(201).json(result.value);
};

const handleRegisterPlayerForTournament = async (
  req: Request,
  res: Response
) => {
  const result = await registerPlayerForTournament.execute({
    ...(req.body as object),
    organizationId: (req as OrganizationRequest).organizationId
  } as Parameters<typeof registerPlayerForTournament.execute>[0]);

  if (!result.success) {
    res
      .status(400)
      .json({ code: result.error.code, message: result.error.message });
    return;
  }

  res.status(201).json(result.value);
};

app.post(
  '/business/reimbursement-claims',
  requirePermission('business', 'write'),
  (req, res) => {
    void handleSubmitReimbursementClaim(req, res);
  }
);

app.post(
  '/league/tournament-registrations',
  requirePermission('tournaments', 'register'),
  (req, res) => {
    void handleRegisterPlayerForTournament(req, res);
  }
);

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`FLIHub API listening on http://localhost:${port.toString()}`);
});
