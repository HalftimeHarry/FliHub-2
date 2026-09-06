import { DomainError, Identifier } from '@flihub/core';

export class Hole {
  private constructor(
    public readonly id: Identifier,
    public readonly courseId: Identifier,
    public readonly number: number,
    public readonly par: number
  ) {}

  public static create(input: {
    id: string;
    courseId: string;
    number: number;
    par?: number;
  }): Hole {
    if (!Number.isInteger(input.number) || input.number < 1) {
      throw new DomainError(
        'league.hole.invalid_number',
        'Hole number must be a positive integer.'
      );
    }

    const par = input.par ?? 3;

    if (!Number.isInteger(par) || par < 1) {
      throw new DomainError(
        'league.hole.invalid_par',
        'Hole par must be a positive integer.'
      );
    }

    return new Hole(
      Identifier.create(input.id, 'hole id'),
      Identifier.create(input.courseId, 'course id'),
      input.number,
      par
    );
  }
}
