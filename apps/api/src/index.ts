import express, { type Request, type Response } from 'express';
import { createSubmitReimbursementClaimWorkflow } from '@flihub/business';
import { createTournamentRegistrationWorkflow } from '@flihub/league';
import { mockUsers } from './mock-users.js';
import { createBusinessRepositories, createLeagueRepositories } from './seed-data.js';

const app = express();
app.use(express.json());

const businessRepositories = createBusinessRepositories();
const leagueRepositories = createLeagueRepositories();

const submitReimbursementClaim = createSubmitReimbursementClaimWorkflow(
  businessRepositories
);
const registerPlayerForTournament = createTournamentRegistrationWorkflow(
  leagueRepositories
);

app.get('/', (_req, res) => {
  res.json({
    name: 'FLIHub API',
    endpoints: [
      'GET /health',
      'GET /users',
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

app.get('/business/departments', (_req, res) => {
  void businessRepositories.departments.list().then((departments) => {
    res.json(
      departments.map((department) => ({
        id: department.id.value,
        organizationId: department.organizationId.value,
        name: department.name
      }))
    );
  });
});

app.get('/business/projects', (_req, res) => {
  void businessRepositories.projects.list().then((projects) => {
    res.json(
      projects.map((project) => ({
        id: project.id.value,
        departmentId: project.departmentId.value,
        name: project.name
      }))
    );
  });
});

app.get('/business/reimbursement-claims', (_req, res) => {
  void businessRepositories.claims.list().then((claims) => {
    res.json(
      claims.map((claim) => ({
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

app.get('/league/players', (_req, res) => {
  void leagueRepositories.players.list().then((players) => {
    res.json(
      players.map((player) => ({
        id: player.id.value,
        displayName: player.displayName,
        active: player.active
      }))
    );
  });
});

app.get('/league/tournaments', (_req, res) => {
  void leagueRepositories.tournaments.list().then((tournaments) => {
    res.json(
      tournaments.map((tournament) => ({
        id: tournament.id.value,
        seasonId: tournament.seasonId.value,
        name: tournament.name,
        capacity: tournament.capacity
      }))
    );
  });
});

app.get('/league/tournament-registrations', (_req, res) => {
  void leagueRepositories.registrations.list().then((registrations) => {
    res.json(
      registrations.map((registration) => ({
        id: registration.id.value,
        tournamentId: registration.tournamentId.value,
        playerId: registration.playerId.value,
        registeredAt: registration.registeredAt.toISOString()
      }))
    );
  });
});

const handleSubmitReimbursementClaim = async (req: Request, res: Response) => {
  const result = await submitReimbursementClaim.execute(
    req.body as Parameters<typeof submitReimbursementClaim.execute>[0]
  );

  if (!result.success) {
    res.status(400).json({ code: result.error.code, message: result.error.message });
    return;
  }

  res.status(201).json(result.value);
};

const handleRegisterPlayerForTournament = async (req: Request, res: Response) => {
  const result = await registerPlayerForTournament.execute(
    req.body as Parameters<typeof registerPlayerForTournament.execute>[0]
  );

  if (!result.success) {
    res.status(400).json({ code: result.error.code, message: result.error.message });
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
