import express, { type Request, type Response } from 'express';
import { createSubmitReimbursementClaimWorkflow } from '@flihub/business';
import {
  Course,
  Hole,
  Tournament,
  createTournamentRegistrationWorkflow,
  type TournamentStatus
} from '@flihub/league';
import { mockUsers } from './mock-users.js';
import {
  createOrganizationContextMiddleware,
  requirePermission,
  type OrganizationRequest
} from './organization-context.js';
import {
  createBusinessRepositories,
  createLeagueRepositories,
  findOrganization,
  seedDefaultOrganizations
} from './seed-data.js';

const app = express();
app.use(express.json());
app.use(
  ['/business', '/league'],
  createOrganizationContextMiddleware(mockUsers)
);

const businessRepositories = createBusinessRepositories();
const leagueRepositories = createLeagueRepositories();

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
      'GET /league/tournaments',
      'POST /league/tournaments',
      'GET /league/courses',
      'POST /league/courses',
      'GET /league/holes',
      'POST /league/holes',
      'POST /league/seed',
      'GET /league/tournament-registrations',
      'POST /league/tournament-registrations'
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
          schoolId: player.schoolId?.value,
          professionalSince: player.professionalSince?.toISOString()
        }))
    );
  });
});

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
    };

    const organizationId = req.organizationId;
    const tournamentCount = Math.max(0, body.tournaments ?? 0);
    const courseCount = Math.max(0, body.courses ?? 0);
    const holesPerCourse = Math.max(1, body.holesPerCourse ?? 18);
    const tournamentCapacity = Math.max(1, body.tournamentCapacity ?? 32);

    void Promise.all([
      leagueRepositories.tournaments.list(),
      leagueRepositories.courses.list(),
      leagueRepositories.holes.list()
    ]).then(async ([tournaments, courses, holes]) => {
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

      res.status(201).json({
        organizationId,
        created: {
          tournaments: createdTournaments.map((tournament) => tournament.id.value),
          courses: createdCourses.map((course) => course.id.value),
          holes: createdHoles.length
        }
      });
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
