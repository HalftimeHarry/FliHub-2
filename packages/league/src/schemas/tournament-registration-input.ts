import { z } from 'zod';

export const tournamentRegistrationInputSchema = z.object({
  playerId: z.string().min(1),
  tournamentId: z.string().min(1),
  requestedAt: z.coerce.date().optional()
});

export type TournamentRegistrationInput = z.input<
  typeof tournamentRegistrationInputSchema
>;
export type ValidatedTournamentRegistrationInput = z.output<
  typeof tournamentRegistrationInputSchema
>;
