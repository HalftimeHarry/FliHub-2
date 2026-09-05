import { DateRange, Identifier } from '@flihub/core';

export class Season {
  private constructor(
    public readonly id: Identifier,
    public readonly leagueId: Identifier,
    public readonly name: string,
    public readonly dateRange: DateRange
  ) {}

  public static create(input: {
    id: string;
    leagueId: string;
    name: string;
    startsOn: Date;
    endsOn: Date;
  }): Season {
    return new Season(
      Identifier.create(input.id, 'season id'),
      Identifier.create(input.leagueId, 'league id'),
      input.name.trim(),
      DateRange.create({ startsOn: input.startsOn, endsOn: input.endsOn })
    );
  }
}
