import { DomainError, Identifier, Money } from '@flihub/core';

export type TicketPurchaseStatus = 'pending' | 'paid' | 'cancelled';
export type TicketPurchaseSource = 'demo' | 'checkout';

export class TicketPurchase {
  private constructor(
    public readonly id: Identifier,
    public readonly ticketTypeId: Identifier,
    public readonly quantity: number,
    public readonly unitPrice: Money,
    public readonly totalAmount: Money,
    public readonly purchaserName: string,
    public readonly purchaserEmail: string | null,
    public readonly purchaserPhone: string | null,
    public readonly source: TicketPurchaseSource,
    public readonly status: TicketPurchaseStatus,
    public readonly createdAt: Date
  ) {}

  public static create(input: {
    id: string;
    ticketTypeId: string;
    quantity: number;
    unitPriceMinorUnits: number;
    currency?: string;
    purchaserName: string;
    purchaserEmail?: string | null;
    purchaserPhone?: string | null;
    source?: TicketPurchaseSource;
    status?: TicketPurchaseStatus;
    createdAt?: Date | string;
  }): TicketPurchase {
    if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
      throw new DomainError(
        'ticketing.ticket_purchase.invalid_quantity',
        'Ticket purchase quantity must be a positive integer.'
      );
    }

    if (!Number.isInteger(input.unitPriceMinorUnits) || input.unitPriceMinorUnits < 0) {
      throw new DomainError(
        'ticketing.ticket_purchase.invalid_price',
        'Ticket purchase unit price must be a non-negative integer in minor units.'
      );
    }

    const trimmedName = input.purchaserName.trim();
    if (trimmedName.length === 0) {
      throw new DomainError(
        'ticketing.ticket_purchase.invalid_purchaser',
        'Purchaser name is required.'
      );
    }

    const currency = input.currency ?? 'USD';
    const unitPrice = Money.fromMinorUnits(input.unitPriceMinorUnits, currency);
    const totalAmount = Money.fromMinorUnits(
      input.unitPriceMinorUnits * input.quantity,
      currency
    );

    return new TicketPurchase(
      Identifier.create(input.id, 'ticket purchase id'),
      Identifier.create(input.ticketTypeId, 'ticket type id'),
      input.quantity,
      unitPrice,
      totalAmount,
      trimmedName,
      input.purchaserEmail?.trim() || null,
      input.purchaserPhone?.trim() || null,
      input.source ?? 'checkout',
      input.status ?? 'pending',
      input.createdAt === undefined ? new Date() : new Date(input.createdAt)
    );
  }

  public get unitPriceMinorUnits(): number {
    return this.unitPrice.minorUnits;
  }

  public get totalMinorUnits(): number {
    return this.totalAmount.minorUnits;
  }

  public get currency(): string {
    return this.totalAmount.currency;
  }

  public static consumesCapacity(status: TicketPurchaseStatus): boolean {
    return status === 'pending' || status === 'paid';
  }
}
