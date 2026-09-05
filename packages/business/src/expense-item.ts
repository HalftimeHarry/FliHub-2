import { DomainError, Money } from '@flihub/core';

export class ExpenseItem {
  private constructor(
    public readonly description: string,
    public readonly amount: Money
  ) {}

  public static create(input: {
    description: string;
    amountMinorUnits: number;
    currency?: string;
  }): ExpenseItem {
    const description = input.description.trim();

    if (description.length < 3) {
      throw new DomainError(
        'business.expense_item.invalid_description',
        'Expense item description must contain at least three characters.'
      );
    }

    return new ExpenseItem(
      description,
      Money.fromMinorUnits(input.amountMinorUnits, input.currency)
    );
  }
}
