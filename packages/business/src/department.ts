import { DomainError, Identifier } from '@flihub/core';

export class Department {
  private constructor(
    public readonly id: Identifier,
    public readonly organizationId: Identifier,
    public readonly name: string
  ) {}

  public static create(input: {
    id: string;
    organizationId: string;
    name: string;
  }): Department {
    const name = input.name.trim();

    if (name.length < 2) {
      throw new DomainError(
        'business.department.invalid_name',
        'Department name must contain at least two characters.'
      );
    }

    return new Department(
      Identifier.create(input.id, 'department id'),
      Identifier.create(input.organizationId, 'organization id'),
      name
    );
  }
}
