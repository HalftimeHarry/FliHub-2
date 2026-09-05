import { DomainError } from './domain-error.js';

export class Money {
  private constructor(
    public readonly minorUnits: number,
    public readonly currency: string
  ) {}

  public static zero(currency = 'USD'): Money {
    return Money.fromMinorUnits(0, currency);
  }

  public static fromMinorUnits(minorUnits: number, currency = 'USD'): Money {
    const normalizedCurrency = currency.trim().toUpperCase();

    if (!Number.isInteger(minorUnits) || minorUnits < 0) {
      throw new DomainError(
        'core.money.invalid_amount',
        'Money amount must be a non-negative integer in minor units.'
      );
    }

    if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
      throw new DomainError(
        'core.money.invalid_currency',
        'Currency must be a three-letter ISO currency code.'
      );
    }

    return new Money(minorUnits, normalizedCurrency);
  }

  public add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new DomainError(
        'core.money.currency_mismatch',
        'Cannot add money values with different currencies.'
      );
    }

    return new Money(this.minorUnits + other.minorUnits, this.currency);
  }
}
