import express, { type Request, type Response } from 'express';
import { Identifier } from '@flihub/core';
import { createSubmitReimbursementClaimWorkflow } from '@flihub/business';
import {
  Course,
  Hole,
  MAX_TEAMS_PER_LEAGUE,
  Season,
  Team,
  Tournament,
  TournamentTeeGroup,
  createTournamentRegistrationWorkflow,
  type SeasonStatus,
  type TournamentStatus,
  type TournamentType
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
const teeGroupScores = new Map<string, Map<number, Record<string, number>>>();

const clearTournamentTeeGroupScores = async (tournamentId: Identifier) => {
  const groups = await leagueRepositories.teeGroups.listForTournament(tournamentId);
  for (const group of groups) {
    teeGroupScores.delete(group.id.value);
  }
};

const submitReimbursementClaim =
  createSubmitReimbursementClaimWorkflow(businessRepositories);
const registerPlayerForTournament =
  createTournamentRegistrationWorkflow(leagueRepositories);

const shuffle = <Value>(values: readonly Value[]): Value[] => {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index]
    ];
  }
  return shuffled;
};

const createTeeGroups = (tournament: Tournament, teams: readonly Team[]) => {
  const shuffledTeams = shuffle(teams);
  return Array.from({ length: 6 }, (_, index) =>
    TournamentTeeGroup.create({
      id: `${tournament.id.value}-group-${(index + 1).toString()}`,
      tournamentId: tournament.id.value,
      number: index + 1,
      teeTime: `3:${(index * 10).toString().padStart(2, '0')} PM PST`,
      teamIds: [
        shuffledTeams[index].id.value,
        shuffledTeams[shuffledTeams.length - 1 - index].id.value
      ]
    })
  );
};

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
      'GET /league/seasons',
      'POST /league/seasons',
      'PUT /league/seasons/:id',
      'DELETE /league/seasons/:id',
      'GET /league/teams',
      'POST /league/teams',
      'GET /league/tournaments',
      'GET /league/tournaments/:id/tee-groups',
      'POST /league/tournaments/:id/tee-groups/seed',
      'PUT /league/tournaments/:id/tee-groups/:groupId/scorekeeper',
      'POST /league/tournaments/:id/tee-groups/scorekeepers/assign-all',
      'GET /league/tournaments/:id/tee-groups/:groupId/scorecard',
      'PUT /league/tournaments/:id/tee-groups/:groupId/scorecard/holes/:holeNumber',
      'DELETE /league/tournaments/:id/tee-groups',
      'POST /league/tournaments/tee-groups/seed-all',
      'POST /league/tournaments',
      'POST /league/tournaments/seed-six',
      'PUT /league/tournaments/:id',
      'DELETE /league/tournaments/:id',
      'POST /league/tournaments/delete-many',
      'GET /league/courses',
      'POST /league/courses',
      'PUT /league/courses/:id',
      'DELETE /league/courses/:id',
      'GET /league/holes',
      'POST /league/holes',
      'POST /league/holes/delete-many',
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

app.get('/league/seasons', (req: OrganizationRequest, res) => {
  void Promise.all([
    leagueRepositories.leagues.list(),
    leagueRepositories.seasons.list()
  ]).then(([leagues, seasons]) => {
    const leagueIds = new Set(
      leagues
        .filter((league) => league.organizationId.value === req.organizationId)
        .map((league) => league.id.value)
    );
    res.json(
      seasons
        .filter((season) => leagueIds.has(season.leagueId.value))
        .map((season) => ({
          id: season.id.value,
          leagueId: season.leagueId.value,
          name: season.name,
          startsOn: season.dateRange.startsOn.toISOString(),
          endsOn: season.dateRange.endsOn.toISOString(),
          yearlyPurseMinorUnits: season.yearlyPurse.minorUnits,
          yearlyPurseCurrency: season.yearlyPurse.currency,
          status: season.status
        }))
    );
  });
});

app.post(
  '/league/seasons',
  requirePermission('league', 'write'),
  (req: OrganizationRequest, res) => {
    const body = req.body as {
      leagueId?: string;
      name?: string;
      startsOn?: string;
      endsOn?: string;
      yearlyPurseMinorUnits?: number;
      yearlyPurseCurrency?: string;
      status?: SeasonStatus;
    };
    if (
      body.leagueId === undefined ||
      body.name === undefined ||
      body.startsOn === undefined ||
      body.endsOn === undefined ||
      body.yearlyPurseMinorUnits === undefined
    ) {
      res.status(400).json({ code: 'league.season.fields_required', message: 'League, name, dates, and yearly purse are required.' });
      return;
    }
    void Promise.all([
      leagueRepositories.leagues.list(),
      leagueRepositories.seasons.list()
    ]).then(async ([leagues, seasons]) => {
      const league = leagues.find((entry) => entry.id.value === body.leagueId);
      if (league?.organizationId.value !== req.organizationId) {
        res.status(400).json({ code: 'league.season.league_not_found', message: 'The selected league does not belong to this organization.' });
        return;
      }
      try {
        const season = Season.create({
          id: `season-${(seasons.length + 1).toString()}`,
          leagueId: league.id.value,
          name: body.name,
          startsOn: new Date(body.startsOn),
          endsOn: new Date(body.endsOn),
          yearlyPurseMinorUnits: body.yearlyPurseMinorUnits,
          yearlyPurseCurrency: body.yearlyPurseCurrency,
          status: body.status
        });
        await leagueRepositories.seasons.save(season);
        res.status(201).json({ id: season.id.value, leagueId: season.leagueId.value, name: season.name, startsOn: season.dateRange.startsOn.toISOString(), endsOn: season.dateRange.endsOn.toISOString(), yearlyPurseMinorUnits: season.yearlyPurse.minorUnits, yearlyPurseCurrency: season.yearlyPurse.currency, status: season.status });
      } catch (error) {
        res.status(400).json({ code: 'league.season.invalid_create', message: error instanceof Error ? error.message : 'Season creation failed.' });
      }
    });
  }
);

app.put(
  '/league/seasons/:id',
  requirePermission('league', 'write'),
  (req: OrganizationRequest, res) => {
    const body = req.body as {
      name?: string;
      startsOn?: string;
      endsOn?: string;
      yearlyPurseMinorUnits?: number;
      yearlyPurseCurrency?: string;
      status?: SeasonStatus;
    };

    if (
      body.name === undefined ||
      body.startsOn === undefined ||
      body.endsOn === undefined ||
      body.yearlyPurseMinorUnits === undefined
    ) {
      res.status(400).json({
        code: 'league.season.fields_required',
        message: 'Name, dates, and yearly purse are required.'
      });
      return;
    }

    void Promise.all([
      leagueRepositories.seasons.list(),
      leagueRepositories.leagues.list()
    ]).then(async ([seasons, leagues]) => {
      const existing = seasons.find(
        (season) => season.id.value === req.params.id
      );
      const league = leagues.find((entry) =>
        entry.id.equals(existing?.leagueId)
      );
      if (existing === undefined || league?.organizationId.value !== req.organizationId) {
        res.status(404).json({
          code: 'league.season.not_found',
          message: 'Season could not be resolved for this organization.'
        });
        return;
      }

      try {
        const season = Season.create({
          id: existing.id.value,
          leagueId: existing.leagueId.value,
          name: body.name,
          startsOn: new Date(body.startsOn),
          endsOn: new Date(body.endsOn),
          yearlyPurseMinorUnits: body.yearlyPurseMinorUnits,
          yearlyPurseCurrency: body.yearlyPurseCurrency,
          status: body.status
        });
        await leagueRepositories.seasons.save(season);
        res.json({
          id: season.id.value,
          leagueId: season.leagueId.value,
          name: season.name,
          startsOn: season.dateRange.startsOn.toISOString(),
          endsOn: season.dateRange.endsOn.toISOString(),
          yearlyPurseMinorUnits: season.yearlyPurse.minorUnits,
          yearlyPurseCurrency: season.yearlyPurse.currency,
          status: season.status
        });
      } catch (error) {
        res.status(400).json({
          code: 'league.season.invalid_update',
          message:
            error instanceof Error ? error.message : 'Season update failed.'
        });
      }
    });
  }
);

app.delete(
  '/league/seasons/:id',
  requirePermission('league', 'write'),
  (req: OrganizationRequest, res) => {
    void Promise.all([
      leagueRepositories.seasons.list(),
      leagueRepositories.leagues.list(),
      leagueRepositories.tournaments.list()
    ]).then(async ([seasons, leagues, tournaments]) => {
      const season = seasons.find((entry) => entry.id.value === req.params.id);
      const league = leagues.find((entry) => entry.id.equals(season?.leagueId));
      if (season === undefined || league?.organizationId.value !== req.organizationId) {
        res.status(404).json({ code: 'league.season.not_found', message: 'Season could not be resolved for this organization.' });
        return;
      }
      if (tournaments.some((tournament) => tournament.seasonId.equals(season.id))) {
        res.status(400).json({ code: 'league.season.has_tournaments', message: 'A season with tournaments cannot be deleted.' });
        return;
      }
      await leagueRepositories.seasons.deleteById(season.id);
      res.status(204).end();
    });
  }
);

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
  void Promise.all([
    leagueRepositories.tournaments.list(),
    leagueRepositories.courses.list()
  ]).then(([tournaments, courses]) => {
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
          type: tournament.type,
          scheduledOn: tournament.scheduledOn?.toISOString(),
          scoringHoleCount:
            tournament.type === 'fli'
              ? 18
              : courses.find((course) =>
                    course.id.equals(tournament.courseId)
                  )?.holeCount,
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
          par: hole.par,
          name: hole.name,
          description: hole.description,
          distanceFeet: hole.distanceFeet,
          blueBasketPosition: hole.blueBasketPosition,
          redBasketPosition: hole.redBasketPosition
        }))
    );
  });
});

app.post(
  '/league/holes/delete-many',
  requirePermission('league', 'write'),
  (req: OrganizationRequest, res) => {
    const body = req.body as { holeIds?: string[] };
    const holeIds = body.holeIds ?? [];
    if (holeIds.length === 0) {
      res.status(400).json({
        code: 'league.hole.selection_required',
        message: 'Select at least one hole to delete.'
      });
      return;
    }
    void Promise.all([
      leagueRepositories.holes.list(),
      leagueRepositories.courses.list()
    ]).then(async ([holes, courses]) => {
      const selected = holes.filter((hole) => holeIds.includes(hole.id.value));
      const organizationCourseIds = new Set(
        courses
          .filter((course) => course.organizationId.value === req.organizationId)
          .map((course) => course.id.value)
      );
      if (
        selected.length !== holeIds.length ||
        selected.some(
          (hole) => !organizationCourseIds.has(hole.courseId.value)
        )
      ) {
        res.status(404).json({
          code: 'league.hole.not_found',
          message: 'One or more holes could not be resolved for this organization.'
        });
        return;
      }
      await Promise.all(
        selected.map((hole) => leagueRepositories.holes.deleteById(hole.id))
      );
      res.json({});
    });
  }
);

app.get(
  '/league/tournaments/:id/tee-groups',
  (req: OrganizationRequest, res) => {
    const tournamentId = Identifier.create(req.params.id, 'tournament id');
    void Promise.all([
      leagueRepositories.tournaments.findById(tournamentId),
      leagueRepositories.teeGroups.listForTournament(tournamentId),
      leagueRepositories.teams.list()
    ]).then(([tournament, groups, teams]) => {
      if (tournament?.organizationId.value !== req.organizationId) {
        res.status(404).json({
          code: 'league.tournament.not_found',
          message: 'Tournament could not be resolved for this organization.'
        });
        return;
      }
      const teamNames = new Map(teams.map((team) => [team.id.value, team.name]));
      res.json(
        groups.map((group) => ({
          id: group.id.value,
          number: group.number,
          teeTime: group.teeTime,
          teamIds: group.teamIds.map((teamId) => teamId.value),
          teamNames: group.teamIds.map(
            (teamId) => teamNames.get(teamId.value) ?? teamId.value
          ),
          scorekeeperId: group.scorekeeperId?.value,
          scorekeeperName: mockUsers.find(
            (user) => user.id === group.scorekeeperId?.value
          )?.name
        }))
      );
    });
  }
);

app.post(
  '/league/tournaments/:id/tee-groups/seed',
  requirePermission('league', 'write'),
  (req: OrganizationRequest, res) => {
    const tournamentId = Identifier.create(req.params.id, 'tournament id');
    void Promise.all([
      leagueRepositories.tournaments.findById(tournamentId),
      leagueRepositories.teams.list()
    ]).then(async ([tournament, teams]) => {
      if (tournament?.organizationId.value !== req.organizationId) {
        res.status(404).json({
          code: 'league.tournament.not_found',
          message: 'Tournament could not be resolved for this organization.'
        });
        return;
      }
      const organizationTeams = teams.filter(
        (team) => team.organizationId.value === req.organizationId
      );
      if (organizationTeams.length !== 12) {
        res.status(400).json({
          code: 'league.tournament_tee_group.requires_twelve_teams',
          message: 'Seeding tee groups requires exactly twelve organization teams.'
        });
        return;
      }
      const groups = createTeeGroups(tournament, organizationTeams);
      await clearTournamentTeeGroupScores(tournament.id);
      await leagueRepositories.teeGroups.deleteForTournament(tournament.id);
      await Promise.all(
        groups.map((group) => leagueRepositories.teeGroups.save(group))
      );
      res.status(201).json({ tournamentId: tournament.id.value, created: groups.length });
    });
  }
);

app.put(
  '/league/tournaments/:id/tee-groups/:groupId/scorekeeper',
  requirePermission('league', 'write'),
  (req: OrganizationRequest, res) => {
    const tournamentId = Identifier.create(req.params.id, 'tournament id');
    const groupId = Identifier.create(req.params.groupId, 'tournament tee group id');
    const body = req.body as { scorekeeperId?: string };
    void Promise.all([
      leagueRepositories.tournaments.findById(tournamentId),
      leagueRepositories.teeGroups.findById(groupId)
    ]).then(async ([tournament, group]) => {
      if (
        tournament?.organizationId.value !== req.organizationId ||
        group === undefined ||
        !group.tournamentId.equals(tournamentId)
      ) {
        res.status(404).json({
          code: 'league.tournament_tee_group.not_found',
          message: 'Tee group could not be resolved for this organization.'
        });
        return;
      }

      const scorekeeper =
        body.scorekeeperId === undefined
          ? undefined
          : mockUsers.find((user) => user.id === body.scorekeeperId);
      if (
        body.scorekeeperId !== undefined &&
        (scorekeeper === undefined ||
          scorekeeper.organizationId !== req.organizationId ||
          !scorekeeper.canScorekeep)
      ) {
        res.status(400).json({
          code: 'league.tournament_tee_group.invalid_scorekeeper',
          message: 'Scorekeeper must be an approved scorekeeper in this organization.'
        });
        return;
      }

      const updatedGroup = TournamentTeeGroup.create({
        id: group.id.value,
        tournamentId: group.tournamentId.value,
        number: group.number,
        teeTime: group.teeTime,
        teamIds: group.teamIds.map((teamId) => teamId.value),
        scorekeeperId: scorekeeper?.id
      });
      await leagueRepositories.teeGroups.save(updatedGroup);
      res.json({});
    });
  }
);

app.post(
  '/league/tournaments/:id/tee-groups/scorekeepers/assign-all',
  requirePermission('league', 'write'),
  (req: OrganizationRequest, res) => {
    const tournamentId = Identifier.create(req.params.id, 'tournament id');
    void Promise.all([
      leagueRepositories.tournaments.findById(tournamentId),
      leagueRepositories.teeGroups.listForTournament(tournamentId)
    ]).then(async ([tournament, groups]) => {
      if (tournament?.organizationId.value !== req.organizationId) {
        res.status(404).json({
          code: 'league.tournament.not_found',
          message: 'Tournament could not be resolved for this organization.'
        });
        return;
      }
      if (groups.length !== 6) {
        res.status(400).json({
          code: 'league.tournament_tee_group.requires_six_groups',
          message: 'Seed all six tee groups before assigning scorekeepers.'
        });
        return;
      }

      const scorekeepers = mockUsers.filter(
        (user) =>
          user.organizationId === req.organizationId && user.canScorekeep
      );
      if (scorekeepers.length < 6) {
        res.status(400).json({
          code: 'league.tournament_tee_group.requires_six_scorekeepers',
          message: 'At least six organization scorekeepers are required.'
        });
        return;
      }

      await Promise.all(
        groups.map((group, index) =>
          leagueRepositories.teeGroups.save(
            TournamentTeeGroup.create({
              id: group.id.value,
              tournamentId: group.tournamentId.value,
              number: group.number,
              teeTime: group.teeTime,
              teamIds: group.teamIds.map((teamId) => teamId.value),
              scorekeeperId: scorekeepers[index].id
            })
          )
        )
      );
      res.json({ assigned: groups.length });
    });
  }
);

app.get(
  '/league/tournaments/:id/tee-groups/:groupId/scorecard',
  (req: OrganizationRequest, res) => {
    const tournamentId = Identifier.create(req.params.id, 'tournament id');
    const groupId = Identifier.create(req.params.groupId, 'tournament tee group id');
    void Promise.all([
      leagueRepositories.tournaments.findById(tournamentId),
      leagueRepositories.teeGroups.findById(groupId),
      leagueRepositories.teams.list(),
      leagueRepositories.players.list(),
      leagueRepositories.courses.list(),
      leagueRepositories.holes.list()
    ]).then(([tournament, group, teams, players, courses, holes]) => {
      if (
        tournament?.organizationId.value !== req.organizationId ||
        group === undefined ||
        !group.tournamentId.equals(tournamentId)
      ) {
        res.status(404).json({ message: 'Tee group could not be resolved for this organization.' });
        return;
      }
      const groupTeams = group.teamIds
        .map((teamId) => teams.find((team) => team.id.equals(teamId)))
        .filter((team): team is Team => team !== undefined);
      const courseHoles = holes
        .filter((hole) => hole.courseId.equals(tournament.courseId))
        .sort((left, right) => left.number - right.number);
      const holeCount = tournament.type === 'fli' ? 18 : courseHoles.length;
      const course = courses.find((entry) => entry.id.equals(tournament.courseId));
      const scoreEntries = teeGroupScores.get(group.id.value) ?? new Map();
      res.json({
        groupId: group.id.value,
        tournamentId: tournament.id.value,
        tournamentName: tournament.name,
        courseName: course?.name ?? 'Course',
        holeCount,
        players: groupTeams.flatMap((team) => [team.malePlayerId, team.femalePlayerId].map((playerId) => ({
          id: playerId.value,
          name: players.find((player) => player.id.equals(playerId))?.displayName ?? playerId.value,
          teamName: team.name
        }))),
        holes: Array.from({ length: holeCount }, (_, index) => {
          const hole = courseHoles[index % courseHoles.length];
          return {
            number: index + 1,
            name: hole?.name ?? `Hole ${(index + 1).toString()}`,
            par: hole?.par ?? 3,
            distanceFeet: hole?.distanceFeet
          };
        }),
        scores: [...scoreEntries.entries()].flatMap(([holeNumber, scores]) =>
          Object.entries(scores).map(([playerId, strokes]) => ({ holeNumber, playerId, strokes }))
        )
      });
    });
  }
);

app.put(
  '/league/tournaments/:id/tee-groups/:groupId/scorecard/holes/:holeNumber',
  (req: OrganizationRequest, res) => {
    const tournamentId = Identifier.create(req.params.id, 'tournament id');
    const groupId = Identifier.create(req.params.groupId, 'tournament tee group id');
    const holeNumber = Number.parseInt(req.params.holeNumber, 10);
    const body = req.body as { playerScores?: Record<string, number> };
    void Promise.all([
      leagueRepositories.tournaments.findById(tournamentId),
      leagueRepositories.teeGroups.findById(groupId),
      leagueRepositories.teams.list(),
      leagueRepositories.holes.list()
    ]).then(([tournament, group, teams, holes]) => {
      if (
        tournament?.organizationId.value !== req.organizationId ||
        group === undefined ||
        !group.tournamentId.equals(tournamentId)
      ) {
        res.status(404).json({ message: 'Tee group could not be resolved for this organization.' });
        return;
      }
      if (
        req.userId !== group.scorekeeperId?.value &&
        req.userRole !== 'admin' &&
        req.userRole !== 'leader'
      ) {
        res.status(403).json({ message: 'Only the assigned scorekeeper can record this group.' });
        return;
      }
      const holeCount = tournament.type === 'fli'
        ? 18
        : holes.filter((hole) => hole.courseId.equals(tournament.courseId)).length;
      const playerIds = new Set(
        group.teamIds.flatMap((teamId) => {
          const team = teams.find((entry) => entry.id.equals(teamId));
          return team === undefined ? [] : [team.malePlayerId.value, team.femalePlayerId.value];
        })
      );
      const scores = body.playerScores;
      if (
        !Number.isInteger(holeNumber) ||
        holeNumber < 1 ||
        holeNumber > holeCount ||
        scores === undefined ||
        playerIds.size !== 4 ||
        Object.keys(scores).length !== playerIds.size ||
        [...playerIds].some((playerId) => !Number.isInteger(scores[playerId]) || scores[playerId] < 1)
      ) {
        res.status(400).json({ message: 'Provide a positive whole-number score for every player in this group.' });
        return;
      }
      const groupScores = teeGroupScores.get(group.id.value) ?? new Map();
      groupScores.set(holeNumber, scores);
      teeGroupScores.set(group.id.value, groupScores);
      res.json({});
    });
  }
);

app.delete(
  '/league/tournaments/:id/tee-groups',
  requirePermission('league', 'write'),
  (req: OrganizationRequest, res) => {
    const tournamentId = Identifier.create(req.params.id, 'tournament id');
    void leagueRepositories.tournaments.findById(tournamentId).then(
      async (tournament) => {
        if (tournament?.organizationId.value !== req.organizationId) {
          res.status(404).json({
            code: 'league.tournament.not_found',
            message: 'Tournament could not be resolved for this organization.'
          });
          return;
        }
        await clearTournamentTeeGroupScores(tournament.id);
        await leagueRepositories.teeGroups.deleteForTournament(tournament.id);
        res.json({});
      }
    );
  }
);

app.post(
  '/league/tournaments/tee-groups/seed-all',
  requirePermission('league', 'write'),
  (req: OrganizationRequest, res) => {
    void Promise.all([
      leagueRepositories.tournaments.list(),
      leagueRepositories.teams.list()
    ]).then(async ([tournaments, teams]) => {
      const organizationTeams = teams.filter(
        (team) => team.organizationId.value === req.organizationId
      );
      if (organizationTeams.length !== 12) {
        res.status(400).json({
          code: 'league.tournament_tee_group.requires_twelve_teams',
          message: 'Seeding tee groups requires exactly twelve organization teams.'
        });
        return;
      }
      const eligibleTournaments = tournaments.filter(
        (tournament) =>
          tournament.organizationId.value === req.organizationId &&
          tournament.type === 'fli'
      );
      for (const tournament of eligibleTournaments) {
        await clearTournamentTeeGroupScores(tournament.id);
        await leagueRepositories.teeGroups.deleteForTournament(tournament.id);
        await Promise.all(
          createTeeGroups(tournament, organizationTeams).map((group) =>
            leagueRepositories.teeGroups.save(group)
          )
        );
      }
      res.status(201).json({ tournaments: eligibleTournaments.length, groups: eligibleTournaments.length * 6 });
    });
  }
);

app.post(
  '/league/tournaments',
  requirePermission('league', 'write'),
  (req: OrganizationRequest, res) => {
    const body = req.body as {
      name?: string;
      seasonId?: string;
      courseId?: string;
      type?: TournamentType;
      scheduledOn?: string;
      status?: TournamentStatus;
    };

    if (body.seasonId === undefined || body.courseId === undefined) {
      res.status(400).json({
        code: 'league.tournament.references_required',
        message: 'A seasonId and courseId are required to add a tournament.'
      });
      return;
    }

    void Promise.all([
      leagueRepositories.tournaments.list(),
      leagueRepositories.seasons.list(),
      leagueRepositories.leagues.list(),
      leagueRepositories.courses.list()
    ]).then(([tournaments, seasons, leagues, courses]) => {
      const season = seasons.find((entry) => entry.id.value === body.seasonId);
      const seasonLeague = leagues.find((league) =>
        league.id.equals(season?.leagueId)
      );
      if (
        season === undefined ||
        seasonLeague?.organizationId.value !== req.organizationId
      ) {
        res.status(400).json({
          code: 'league.tournament.season_not_found',
          message: 'The selected season does not belong to this organization.'
        });
        return;
      }
      const course = courses.find((entry) => entry.id.value === body.courseId);
      if (course?.organizationId.value !== req.organizationId) {
        res.status(400).json({
          code: 'league.tournament.course_not_found',
          message: 'The selected course does not belong to this organization.'
        });
        return;
      }
      if ((body.type ?? 'fli') === 'fli' && course.holeCount !== 9) {
        res.status(400).json({
          code: 'league.tournament.fli_course_requires_nine_holes',
          message: 'An FLI tournament requires a nine-hole course played twice.'
        });
        return;
      }

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
        seasonId: season.id.value,
        name: body.name ?? '',
        type: body.type,
        scheduledOn:
          body.scheduledOn === undefined ? undefined : new Date(body.scheduledOn),
        status: body.status,
        courseId: body.courseId
      });

      void leagueRepositories.tournaments.save(tournament).then(() => {
        res.status(201).json({
          id: tournament.id.value,
          organizationId: tournament.organizationId.value,
          seasonId: tournament.seasonId.value,
          name: tournament.name,
          type: tournament.type,
          scheduledOn: tournament.scheduledOn?.toISOString(),
          scoringHoleCount:
            tournament.type === 'fli' ? 18 : course.holeCount,
          status: tournament.status,
          courseId: tournament.courseId?.value
        });
      });
    });
  }
);

app.post(
  '/league/tournaments/delete-many',
  requirePermission('league', 'write'),
  (req: OrganizationRequest, res) => {
    const body = req.body as { tournamentIds?: string[] };
    const tournamentIds = body.tournamentIds ?? [];
    if (tournamentIds.length === 0) {
      res.status(400).json({
        code: 'league.tournament.selection_required',
        message: 'Select at least one tournament to delete.'
      });
      return;
    }
    void Promise.all([
      leagueRepositories.tournaments.list(),
      leagueRepositories.registrations.list()
    ]).then(async ([tournaments, registrations]) => {
      const selected = tournaments.filter((tournament) =>
        tournamentIds.includes(tournament.id.value)
      );
      if (
        selected.length !== tournamentIds.length ||
        selected.some(
          (tournament) =>
            tournament.organizationId.value !== req.organizationId
        )
      ) {
        res.status(404).json({
          code: 'league.tournament.not_found',
          message: 'One or more tournaments could not be resolved for this organization.'
        });
        return;
      }
      if (
        registrations.some((registration) =>
          selected.some((tournament) =>
            registration.tournamentId.equals(tournament.id)
          )
        )
      ) {
        res.status(400).json({
          code: 'league.tournament.has_registrations',
          message: 'Tournaments with registrations cannot be deleted.'
        });
        return;
      }
      await Promise.all(
        selected.map((tournament) =>
          leagueRepositories.tournaments.deleteById(tournament.id)
        )
      );
      res.json({});
    });
  }
);

app.post(
  '/league/tournaments/seed-six',
  requirePermission('league', 'write'),
  (req: OrganizationRequest, res) => {
    const body = req.body as {
      seasonId?: string;
      courseId?: string;
      type?: TournamentType;
    };
    if (body.seasonId === undefined || body.courseId === undefined || body.type === undefined) {
      res.status(400).json({
        code: 'league.tournament.references_required',
        message: 'A seasonId, courseId, and type are required to seed tournaments.'
      });
      return;
    }
    void Promise.all([
      leagueRepositories.tournaments.list(),
      leagueRepositories.seasons.list(),
      leagueRepositories.leagues.list(),
      leagueRepositories.courses.list()
    ]).then(async ([tournaments, seasons, leagues, courses]) => {
      const season = seasons.find((entry) => entry.id.value === body.seasonId);
      const league = leagues.find((entry) => entry.id.equals(season?.leagueId));
      const course = courses.find((entry) => entry.id.value === body.courseId);
      if (
        season === undefined ||
        league?.organizationId.value !== req.organizationId ||
        course?.organizationId.value !== req.organizationId
      ) {
        res.status(400).json({
          code: 'league.tournament.reference_not_found',
          message: 'The selected season or course does not belong to this organization.'
        });
        return;
      }
      if (body.type === 'fli' && course.holeCount !== 9) {
        res.status(400).json({
          code: 'league.tournament.fli_course_requires_nine_holes',
          message: 'An FLI tournament requires a nine-hole course played twice.'
        });
        return;
      }

      const existingIds = new Set(tournaments.map((tournament) => tournament.id.value));
      const created: Tournament[] = [];
      const rangeStart = season.dateRange.startsOn.getTime();
      const rangeEnd = season.dateRange.endsOn.getTime();
      const eventNames = [
        'Sunset Open',
        'Canyon Heat Cup',
        'Summer Solstice Invitational',
        'High Desert Classic',
        'Mesa Flight Showdown',
        'Summer Championship'
      ];
      const scheduledDates = Array.from({ length: eventNames.length }, () =>
        new Date(
          rangeStart + Math.floor(Math.random() * (rangeEnd - rangeStart + 1))
        )
      ).sort((left, right) => left.getTime() - right.getTime());
      for (const [index, name] of eventNames.entries()) {
        let id = `tournament-${(tournaments.length + index + 1).toString()}`;
        while (existingIds.has(id)) {
          id = `tournament-${(Number(id.split('-')[1]) + 1).toString()}`;
        }
        existingIds.add(id);
        const tournament = Tournament.create({
          id,
          organizationId: req.organizationId,
          seasonId: season.id.value,
          name,
          type: body.type,
          scheduledOn: scheduledDates[index],
          courseId: course.id.value
        });
        created.push(tournament);
        await leagueRepositories.tournaments.save(tournament);
      }
      res.status(201).json(
        created.map((tournament) => ({
          id: tournament.id.value,
          organizationId: tournament.organizationId.value,
          seasonId: tournament.seasonId.value,
          name: tournament.name,
          type: tournament.type,
          scheduledOn: tournament.scheduledOn?.toISOString(),
          scoringHoleCount: tournament.type === 'fli' ? 18 : course.holeCount,
          status: tournament.status,
          courseId: tournament.courseId?.value
        }))
      );
    });
  }
);

app.put(
  '/league/tournaments/:id',
  requirePermission('league', 'write'),
  (req: OrganizationRequest, res) => {
    const body = req.body as {
      name?: string;
      seasonId?: string;
      courseId?: string;
      type?: TournamentType;
      scheduledOn?: string;
      status?: TournamentStatus;
    };
    if (
      body.name === undefined ||
      body.seasonId === undefined ||
      body.courseId === undefined ||
      body.type === undefined
    ) {
      res.status(400).json({ code: 'league.tournament.fields_required', message: 'Name, season, course, and type are required.' });
      return;
    }
    void Promise.all([
      leagueRepositories.tournaments.list(),
      leagueRepositories.seasons.list(),
      leagueRepositories.leagues.list(),
      leagueRepositories.courses.list()
    ]).then(async ([tournaments, seasons, leagues, courses]) => {
      const existing = tournaments.find((entry) => entry.id.value === req.params.id);
      const season = seasons.find((entry) => entry.id.value === body.seasonId);
      const seasonLeague = leagues.find((entry) => entry.id.equals(season?.leagueId));
      const course = courses.find((entry) => entry.id.value === body.courseId);
      if (
        existing?.organizationId.value !== req.organizationId ||
        seasonLeague?.organizationId.value !== req.organizationId ||
        course?.organizationId.value !== req.organizationId
      ) {
        res.status(404).json({ code: 'league.tournament.not_found', message: 'Tournament references could not be resolved for this organization.' });
        return;
      }
      if (body.type === 'fli' && course.holeCount !== 9) {
        res.status(400).json({ code: 'league.tournament.fli_course_requires_nine_holes', message: 'An FLI tournament requires a nine-hole course played twice.' });
        return;
      }
      try {
        const tournament = Tournament.create({
          id: existing.id.value,
          organizationId: existing.organizationId.value,
          seasonId: season.id.value,
          name: body.name,
          type: body.type,
          scheduledOn: body.scheduledOn === undefined ? undefined : new Date(body.scheduledOn),
          status: body.status,
          courseId: course.id.value
        });
        await leagueRepositories.tournaments.save(tournament);
        res.json({ id: tournament.id.value, organizationId: tournament.organizationId.value, seasonId: tournament.seasonId.value, name: tournament.name, type: tournament.type, scheduledOn: tournament.scheduledOn?.toISOString(), scoringHoleCount: tournament.type === 'fli' ? 18 : course.holeCount, status: tournament.status, courseId: tournament.courseId?.value });
      } catch (error) {
        res.status(400).json({ code: 'league.tournament.invalid_update', message: error instanceof Error ? error.message : 'Tournament update failed.' });
      }
    });
  }
);

app.delete(
  '/league/tournaments/:id',
  requirePermission('league', 'write'),
  (req: OrganizationRequest, res) => {
    void Promise.all([
      leagueRepositories.tournaments.findById(Identifier.create(req.params.id, 'tournament id')),
      leagueRepositories.registrations.list()
    ]).then(async ([tournament, registrations]) => {
      if (tournament?.organizationId.value !== req.organizationId) {
        res.status(404).json({ code: 'league.tournament.not_found', message: 'Tournament could not be resolved for this organization.' });
        return;
      }
      if (registrations.some((registration) => registration.tournamentId.equals(tournament.id))) {
        res.status(400).json({ code: 'league.tournament.has_registrations', message: 'A tournament with registrations cannot be deleted.' });
        return;
      }
      await leagueRepositories.tournaments.deleteById(tournament.id);
      res.status(204).end();
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

app.put(
  '/league/courses/:id',
  requirePermission('league', 'write'),
  (req: OrganizationRequest, res) => {
    const body = req.body as { name?: string; holeCount?: number };
    if (body.name === undefined || body.holeCount === undefined) {
      res.status(400).json({
        code: 'league.course.fields_required',
        message: 'Name and hole count are required.'
      });
      return;
    }
    const courseId = Identifier.create(req.params.id, 'course id');
    void Promise.all([
      leagueRepositories.courses.findById(courseId),
      leagueRepositories.holes.list()
    ]).then(async ([existing, holes]) => {
      if (existing?.organizationId.value !== req.organizationId) {
        res.status(404).json({
          code: 'league.course.not_found',
          message: 'Course could not be resolved for this organization.'
        });
        return;
      }
      if (
        holes.some(
          (hole) =>
            hole.courseId.equals(existing.id) && hole.number > body.holeCount
        )
      ) {
        res.status(400).json({
          code: 'league.course.hole_count_conflict',
          message: 'Delete higher-numbered holes before reducing the course hole count.'
        });
        return;
      }
      try {
        const course = Course.create({
          id: existing.id.value,
          organizationId: existing.organizationId.value,
          name: body.name,
          holeCount: body.holeCount
        });
        await leagueRepositories.courses.save(course);
        res.json({
          id: course.id.value,
          organizationId: course.organizationId.value,
          name: course.name,
          holeCount: course.holeCount
        });
      } catch (error) {
        res.status(400).json({
          code: 'league.course.invalid_update',
          message: error instanceof Error ? error.message : 'Course update failed.'
        });
      }
    });
  }
);

app.delete(
  '/league/courses/:id',
  requirePermission('league', 'write'),
  (req: OrganizationRequest, res) => {
    const courseId = Identifier.create(req.params.id, 'course id');
    void Promise.all([
      leagueRepositories.courses.findById(courseId),
      leagueRepositories.tournaments.list(),
      leagueRepositories.holes.list()
    ]).then(async ([course, tournaments, holes]) => {
      if (course?.organizationId.value !== req.organizationId) {
        res.status(404).json({
          code: 'league.course.not_found',
          message: 'Course could not be resolved for this organization.'
        });
        return;
      }
      if (
        tournaments.some((tournament) => tournament.courseId?.equals(course.id)) ||
        holes.some((hole) => hole.courseId.equals(course.id))
      ) {
        res.status(400).json({
          code: 'league.course.has_references',
          message: 'A course with tournaments or holes cannot be deleted.'
        });
        return;
      }
      await leagueRepositories.courses.deleteById(course.id);
      res.status(204).end();
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
