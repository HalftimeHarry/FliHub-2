import { DomainError, Identifier } from '@flihub/core';

export class Project {
  private constructor(
    public readonly id: Identifier,
    public readonly departmentId: Identifier,
    public readonly name: string
  ) {}

  public static create(input: {
    id: string;
    departmentId: string;
    name: string;
  }): Project {
    const name = input.name.trim();

    if (name.length < 2) {
      throw new DomainError(
        'business.project.invalid_name',
        'Project name must contain at least two characters.'
      );
    }

    return new Project(
      Identifier.create(input.id, 'project id'),
      Identifier.create(input.departmentId, 'department id'),
      name
    );
  }
}
