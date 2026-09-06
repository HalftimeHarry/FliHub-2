import { DomainError, Identifier } from '@flihub/core';

export class Course {
  private constructor(
    public readonly id: Identifier,
    public readonly organizationId: Identifier,
    public readonly name: string,
    public readonly holeCount: number
  ) {}

  public static create(input: {
    id: string;
    organizationId: string;
    name: string;
    holeCount?: number;
  }): Course {
    const name = input.name.trim();

    if (name.length < 2) {
      throw new DomainError(
        'league.course.invalid_name',
        'Course name must contain at least two characters.'
      );
    }

    const holeCount = input.holeCount ?? 18;

    if (!Number.isInteger(holeCount) || holeCount < 1) {
      throw new DomainError(
        'league.course.invalid_hole_count',
        'Course hole count must be a positive integer.'
      );
    }

    return new Course(
      Identifier.create(input.id, 'course id'),
      Identifier.create(input.organizationId, 'organization id'),
      name,
      holeCount
    );
  }
}
