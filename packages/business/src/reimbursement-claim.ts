import { DomainError, Identifier, Money } from '@flihub/core';
import type { ExpenseItem } from './expense-item.js';

export type ReimbursementClaimStatus =
  'submitted' | 'approved' | 'rejected' | 'marked-for-payment';

export class ReimbursementClaim {
  private constructor(
    public readonly id: Identifier,
    public readonly claimantId: Identifier,
    public readonly departmentId: Identifier,
    public readonly projectId: Identifier | undefined,
    public readonly items: readonly ExpenseItem[],
    public readonly total: Money,
    public readonly status: ReimbursementClaimStatus
  ) {}

  public static submit(input: {
    id: string;
    claimantId: string;
    departmentId: string;
    projectId?: string;
    items: readonly ExpenseItem[];
  }): ReimbursementClaim {
    if (input.items.length === 0) {
      throw new DomainError(
        'business.reimbursement.empty_items',
        'A reimbursement claim requires at least one expense item.'
      );
    }

    const total = input.items.reduce(
      (runningTotal, item) => runningTotal.add(item.amount),
      Money.zero(input.items[0]?.amount.currency)
    );

    return new ReimbursementClaim(
      Identifier.create(input.id, 'reimbursement claim id'),
      Identifier.create(input.claimantId, 'claimant id'),
      Identifier.create(input.departmentId, 'department id'),
      input.projectId === undefined
        ? undefined
        : Identifier.create(input.projectId, 'project id'),
      [...input.items],
      total,
      'submitted'
    );
  }
}
