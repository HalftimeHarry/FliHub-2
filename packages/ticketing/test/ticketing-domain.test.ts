import { describe, expect, it } from 'vitest';
import { TicketPurchase, TicketType } from '../src/index.js';

describe('ticketing domain', () => {
  it('creates valid ticket types with Money-based pricing and optional capacity', () => {
    const ticketType = TicketType.create({
      id: 'ticket-type-general',
      tournamentId: 'tournament-1',
      name: 'General Admission',
      priceMinorUnits: 4500,
      currency: 'USD',
      capacity: 200,
      active: true
    });

    expect(ticketType.name).toBe('General Admission');
    expect(ticketType.priceMinorUnits).toBe(4500);
    expect(ticketType.currency).toBe('USD');
    expect(ticketType.capacity).toBe(200);
    expect(ticketType.active).toBe(true);
  });

  it('rejects invalid quantities and negative prices', () => {
    expect(() =>
      TicketPurchase.create({
        id: 'purchase-1',
        ticketTypeId: 'ticket-type-general',
        quantity: 0,
        unitPriceMinorUnits: 4500,
        purchaserName: 'A. Fan'
      })
    ).toThrow(/positive integer/i);

    expect(() =>
      TicketPurchase.create({
        id: 'purchase-2',
        ticketTypeId: 'ticket-type-general',
        quantity: 2,
        unitPriceMinorUnits: -1,
        purchaserName: 'A. Fan'
      })
    ).toThrow(/non-negative integer/i);
  });

  it('preserves purchase-time pricing and tracks capacity-consuming states', () => {
    const purchase = TicketPurchase.create({
      id: 'purchase-3',
      ticketTypeId: 'ticket-type-vip',
      quantity: 2,
      unitPriceMinorUnits: 7500,
      currency: 'USD',
      purchaserName: 'VIP Guest',
      source: 'demo',
      status: 'pending'
    });

    expect(purchase.unitPriceMinorUnits).toBe(7500);
    expect(purchase.totalMinorUnits).toBe(15000);
    expect(purchase.currency).toBe('USD');
    expect(TicketPurchase.consumesCapacity('pending')).toBe(true);
    expect(TicketPurchase.consumesCapacity('paid')).toBe(true);
    expect(TicketPurchase.consumesCapacity('cancelled')).toBe(false);
  });
});
