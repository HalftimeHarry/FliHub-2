import { DomainError, Identifier } from '@flihub/core';

export class Hole {
  private constructor(
    public readonly id: Identifier,
    public readonly courseId: Identifier,
    public readonly number: number,
    public readonly par: number,
    public readonly name: string | undefined,
    public readonly description: string | undefined,
    public readonly distanceFeet: number | undefined,
    public readonly blueBasketPosition: string | undefined,
    public readonly redBasketPosition: string | undefined
  ) {}

  public static create(input: {
    id: string;
    courseId: string;
    number: number;
    par?: number;
    name?: string;
    description?: string;
    distanceFeet?: number;
    blueBasketPosition?: string;
    redBasketPosition?: string;
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

    if (
      input.distanceFeet !== undefined &&
      (!Number.isInteger(input.distanceFeet) || input.distanceFeet < 1)
    ) {
      throw new DomainError(
        'league.hole.invalid_distance',
        'Hole distance must be a positive whole number of feet.'
      );
    }

    return new Hole(
      Identifier.create(input.id, 'hole id'),
      Identifier.create(input.courseId, 'course id'),
      input.number,
      par,
      input.name === undefined || input.name.trim() === ''
        ? undefined
        : input.name.trim(),
      input.description === undefined || input.description.trim() === ''
        ? undefined
        : input.description.trim(),
      input.distanceFeet,
      input.blueBasketPosition === undefined ||
      input.blueBasketPosition.trim() === ''
        ? undefined
        : input.blueBasketPosition.trim(),
      input.redBasketPosition === undefined || input.redBasketPosition.trim() === ''
        ? undefined
        : input.redBasketPosition.trim()
    );
  }
}
