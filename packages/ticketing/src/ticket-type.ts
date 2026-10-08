import { DomainError, Identifier, Money } from '@flihub/core';

export class TicketType {
  private constructor(
    public readonly id: Identifier,
    public readonly tournamentId: Identifier,
    public readonly name: string,
    public readonly price: Money,
    public readonly capacity: number | null,
    public readonly active: boolean
  ) {}

  public static create(input: {
    id: string;
    tournamentId: string;
    name: string;
    priceMinorUnits: number;
    currency?: string;
    capacity?: number | null;
    active?: boolean;
  }): TicketType {
    const trimmedName = input.name.trim();
    if (trimmedName.length === 0) {
      throw new DomainError(
        'ticketing.ticket_type.invalid_name',
        'Ticket type name is required.'
      );
    }

    if (!Number.isInteger(input.priceMinorUnits) || input.priceMinorUnits < 0) {
      throw new DomainError(
        'ticketing.ticket_type.invalid_price',
        'Ticket type price must be a non-negative integer in minor units.'
      );
    }

    const normalizedCapacity = input.capacity ?? null;
    if (normalizedCapacity !== null && (!Number.isInteger(normalizedCapacity) || normalizedCapacity < 0)) {
      throw new DomainError(
        'ticketing.ticket_type.invalid_capacity',
        'Ticket type capacity must be a non-negative integer when provided.'
      );
    }

    return new TicketType(
      Identifier.create(input.id, 'ticket type id'),
      Identifier.create(input.tournamentId, 'tournament id'),
      trimmedName,
      Money.fromMinorUnits(input.priceMinorUnits, input.currency ?? 'USD'),
      normalizedCapacity,
      input.active ?? true
    );
  }

  public get priceMinorUnits(): number {
    return this.price.minorUnits;
  }

  public get currency(): string {
    return this.price.currency;
  }

  public get availableCapacity(): number | null {
    return this.capacity;
  }
}
