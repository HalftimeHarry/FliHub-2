import { DomainError } from './domain-error.js';

export class DateRange {
  private constructor(
    public readonly startsOn: Date,
    public readonly endsOn: Date
  ) {}

  public static create(input: { startsOn: Date; endsOn: Date }): DateRange {
    if (input.endsOn.getTime() < input.startsOn.getTime()) {
      throw new DomainError(
        'core.date_range.invalid_order',
        'Date range end must be on or after the start.'
      );
    }

    return new DateRange(new Date(input.startsOn), new Date(input.endsOn));
  }

  public contains(date: Date): boolean {
    const timestamp = date.getTime();

    return (
      timestamp >= this.startsOn.getTime() && timestamp <= this.endsOn.getTime()
    );
  }
}
