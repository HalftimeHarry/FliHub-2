import { DateRange, Identifier, Money } from '@flihub/core';

export type SeasonStatus = 'current' | 'upcoming' | 'completed';

export class Season {
  private constructor(
    public readonly id: Identifier,
    public readonly leagueId: Identifier,
    public readonly name: string,
    public readonly dateRange: DateRange,
    public readonly yearlyPurse: Money,
    public readonly status: SeasonStatus
  ) {}

  public static create(input: {
    id: string;
    leagueId: string;
    name: string;
    startsOn: Date;
    endsOn: Date;
    yearlyPurseMinorUnits?: number;
    yearlyPurseCurrency?: string;
    status?: SeasonStatus;
  }): Season {
    return new Season(
      Identifier.create(input.id, 'season id'),
      Identifier.create(input.leagueId, 'league id'),
      input.name.trim(),
      DateRange.create({ startsOn: input.startsOn, endsOn: input.endsOn }),
      Money.fromMinorUnits(
        input.yearlyPurseMinorUnits ?? 0,
        input.yearlyPurseCurrency
      ),
      input.status ?? 'upcoming'
    );
  }
}
