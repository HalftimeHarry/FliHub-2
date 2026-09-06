import express, { type Request, type Response } from 'express';
import { createSubmitReimbursementClaimWorkflow } from '@flihub/business';
import { createTournamentRegistrationWorkflow } from '@flihub/league';
import { mockUsers } from './mock-users.js';
import {
  createOrganizationContextMiddleware,
  type OrganizationRequest
} from './organization-context.js';
import {
  createBusinessRepositories,
  createLeagueRepositories
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
      'GET /business/departments',
      'GET /business/projects',
      'GET /business/reimbursement-claims',
      'POST /business/reimbursement-claims',
      'GET /league/players',
      'GET /league/tournaments',
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
          active: player.active
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
          capacity: tournament.capacity
        }))
    );
  });
});

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

app.post('/business/reimbursement-claims', (req, res) => {
  void handleSubmitReimbursementClaim(req, res);
});

app.post('/league/tournament-registrations', (req, res) => {
  void handleRegisterPlayerForTournament(req, res);
});

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`FLIHub API listening on http://localhost:${port.toString()}`);
});
