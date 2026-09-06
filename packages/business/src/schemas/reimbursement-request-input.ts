import { z } from 'zod';

export const reimbursementRequestInputSchema = z.object({
  organizationId: z.string().min(1),
  claimantId: z.string().min(1),
  departmentId: z.string().min(1),
  projectId: z.string().min(1).optional(),
  items: z
    .array(
      z.object({
        description: z.string().min(3),
        amountMinorUnits: z.number().int().positive(),
        currency: z.string().length(3).optional()
      })
    )
    .min(1)
});

export type ReimbursementRequestInput = z.input<
  typeof reimbursementRequestInputSchema
>;
export type ValidatedReimbursementRequestInput = z.output<
  typeof reimbursementRequestInputSchema
>;
