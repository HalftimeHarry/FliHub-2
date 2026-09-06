import { DomainError } from './domain-error.js';
import { Identifier } from './identifier.js';

export type OrganizationType = 'operator' | 'school';

export class Organization {
  private constructor(
    public readonly id: Identifier,
    public readonly name: string,
    public readonly type: OrganizationType,
    public readonly paysTeams: boolean
  ) {}

  public static create(input: {
    id: string;
    name: string;
    type?: OrganizationType;
    paysTeams?: boolean;
  }): Organization {
    const name = input.name.trim();

    if (name.length < 2) {
      throw new DomainError(
        'core.organization.invalid_name',
        'Organization name must contain at least two characters.'
      );
    }

    return new Organization(
      Identifier.create(input.id, 'organization id'),
      name,
      input.type ?? 'school',
      input.paysTeams ?? false
    );
  }
}
