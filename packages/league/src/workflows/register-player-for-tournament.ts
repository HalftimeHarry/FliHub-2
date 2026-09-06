import { DomainError, Identifier } from '@flihub/core';
import { fail, Pipeline, succeed, type PipelineStage } from '@flihub/workflows';
import type { Player } from '../player.js';
import type { Tournament } from '../tournament.js';
import { TournamentRegistration } from '../tournament-registration.js';
import type {
  PlayerRepository,
  TournamentRegistrationRepository,
  TournamentRepository
} from '../repositories/tournament-repositories.js';
import {
  tournamentRegistrationInputSchema,
  type TournamentRegistrationInput,
  type ValidatedTournamentRegistrationInput
} from '../schemas/tournament-registration-input.js';

export interface RegisterPlayerForTournamentRepositories {
  readonly players: PlayerRepository;
  readonly tournaments: TournamentRepository;
  readonly registrations: TournamentRegistrationRepository;
}

interface ResolvedTournamentRegistrationContext {
  readonly request: ValidatedTournamentRegistrationInput;
  readonly player: Player;
  readonly tournament: Tournament;
}

export interface TournamentRegistrationResultDto {
  readonly registrationId: string;
  readonly tournamentId: string;
  readonly playerId: string;
  readonly registeredAt: string;
}

const validateInput: PipelineStage<
  TournamentRegistrationInput,
  ValidatedTournamentRegistrationInput
> = (input) => {
  const parsedInput = tournamentRegistrationInputSchema.safeParse(input);

  if (!parsedInput.success) {
    return fail(
      new DomainError(
        'league.registration.invalid_input',
        parsedInput.error.issues[0]?.message ?? 'Registration input is invalid.'
      )
    );
  }

  return succeed(parsedInput.data);
};

const resolveTournamentRegistrationContext =
  (
    repositories: RegisterPlayerForTournamentRepositories
  ): PipelineStage<
    ValidatedTournamentRegistrationInput,
    ResolvedTournamentRegistrationContext
  > =>
  async (request) => {
    const playerId = Identifier.create(request.playerId, 'player id');
    const tournamentId = Identifier.create(
      request.tournamentId,
      'tournament id'
    );
    const [player, tournament] = await Promise.all([
      repositories.players.findById(playerId),
      repositories.tournaments.findById(tournamentId)
    ]);

    if (player === undefined) {
      return fail(
        new DomainError(
          'league.registration.player_not_found',
          'Player could not be resolved.'
        )
      );
    }

    if (tournament === undefined) {
      return fail(
        new DomainError(
          'league.registration.tournament_not_found',
          'Tournament could not be resolved.'
        )
      );
    }

    if (
      !player.organizationId.equals(tournament.organizationId) ||
      player.organizationId.value !== request.organizationId
    ) {
      return fail(
        new DomainError(
          'league.registration.organization_mismatch',
          'Player and tournament must belong to the requested organization.'
        )
      );
    }

    return succeed({ request, player, tournament });
  };

const ensurePlayerCanRegister: PipelineStage<
  ResolvedTournamentRegistrationContext,
  ResolvedTournamentRegistrationContext
> = (context) => {
  if (!context.player.canRegisterForTournament()) {
    return fail(
      new DomainError(
        'league.registration.player_inactive',
        'Inactive players cannot register for tournaments.'
      )
    );
  }

  if (!context.tournament.isRegistrationOpen()) {
    return fail(
      new DomainError(
        'league.registration.tournament_not_open',
        'Registration is only open while the tournament is scheduled.'
      )
    );
  }

  return succeed(context);
};

const ensureRegistrationIsAvailable =
  (
    repositories: RegisterPlayerForTournamentRepositories
  ): PipelineStage<
    ResolvedTournamentRegistrationContext,
    ResolvedTournamentRegistrationContext
  > =>
  async (context) => {
    const [alreadyRegistered, registrationCount] = await Promise.all([
      repositories.registrations.existsForPlayer(
        context.tournament.id,
        context.player.id
      ),
      repositories.registrations.countForTournament(context.tournament.id)
    ]);

    if (alreadyRegistered) {
      return fail(
        new DomainError(
          'league.registration.duplicate',
          'Player is already registered for this tournament.'
        )
      );
    }

    if (!context.tournament.hasCapacity(registrationCount)) {
      return fail(
        new DomainError(
          'league.registration.capacity_reached',
          'Tournament capacity has been reached.'
        )
      );
    }

    return succeed(context);
  };

const createRegistration =
  (
    repositories: RegisterPlayerForTournamentRepositories
  ): PipelineStage<
    ResolvedTournamentRegistrationContext,
    TournamentRegistrationResultDto
  > =>
  async (context) => {
    const registration = TournamentRegistration.create({
      tournamentId: context.tournament.id,
      playerId: context.player.id,
      registeredAt: context.request.requestedAt ?? new Date()
    });

    await repositories.registrations.save(registration);

    return succeed({
      registrationId: registration.id.value,
      tournamentId: registration.tournamentId.value,
      playerId: registration.playerId.value,
      registeredAt: registration.registeredAt.toISOString()
    });
  };

export const createTournamentRegistrationWorkflow = (
  repositories: RegisterPlayerForTournamentRepositories
) =>
  Pipeline.start<TournamentRegistrationInput>()
    .pipe(validateInput)
    .pipe(resolveTournamentRegistrationContext(repositories))
    .pipe(ensurePlayerCanRegister)
    .pipe(ensureRegistrationIsAvailable(repositories))
    .pipe(createRegistration(repositories));
