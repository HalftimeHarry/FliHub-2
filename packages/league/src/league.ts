import { DomainError, Identifier } from '@flihub/core';

export class League {
  private constructor(
    public readonly id: Identifier,
    public readonly organizationId: Identifier,
    public readonly name: string
  ) {}

  public static create(input: {
    id: string;
    organizationId: string;
    name: string;
  }): League {
    const name = input.name.trim();

    if (name.length < 2) {
      throw new DomainError(
        'league.invalid_name',
        'League name must contain at least two characters.'
      );
    }

    return new League(
      Identifier.create(input.id, 'league id'),
      Identifier.create(input.organizationId, 'organization id'),
      name
    );
  }
}
