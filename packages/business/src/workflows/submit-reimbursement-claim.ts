import { DomainError, Identifier } from '@flihub/core';
import { fail, Pipeline, succeed, type PipelineStage } from '@flihub/workflows';
import { ExpenseItem } from '../expense-item.js';
import type { Department } from '../department.js';
import type { Project } from '../project.js';
import { ReimbursementClaim } from '../reimbursement-claim.js';
import type {
  DepartmentRepository,
  ProjectRepository,
  ReimbursementClaimRepository
} from '../repositories.js';
import {
  reimbursementRequestInputSchema,
  type ReimbursementRequestInput,
  type ValidatedReimbursementRequestInput
} from '../schemas/reimbursement-request-input.js';

export interface SubmitReimbursementClaimRepositories {
  readonly departments: DepartmentRepository;
  readonly projects: ProjectRepository;
  readonly claims: ReimbursementClaimRepository;
}

interface ResolvedReimbursementRequestContext {
  readonly request: ValidatedReimbursementRequestInput;
  readonly department: Department;
  readonly project: Project | undefined;
}

export interface ReimbursementClaimResultDto {
  readonly claimId: string;
  readonly departmentId: string;
  readonly projectId: string | undefined;
  readonly totalMinorUnits: number;
  readonly currency: string;
  readonly status: string;
}

const validateInput: PipelineStage<
  ReimbursementRequestInput,
  ValidatedReimbursementRequestInput
> = (input) => {
  const parsedInput = reimbursementRequestInputSchema.safeParse(input);

  if (!parsedInput.success) {
    return fail(
      new DomainError(
        'business.reimbursement.invalid_input',
        parsedInput.error.issues[0]?.message ??
          'Reimbursement input is invalid.'
      )
    );
  }

  return succeed(parsedInput.data);
};

const resolveBusinessContext =
  (
    repositories: SubmitReimbursementClaimRepositories
  ): PipelineStage<
    ValidatedReimbursementRequestInput,
    ResolvedReimbursementRequestContext
  > =>
  async (request) => {
    const departmentId = Identifier.create(
      request.departmentId,
      'department id'
    );
    const department = await repositories.departments.findById(departmentId);

    if (department === undefined) {
      return fail(
        new DomainError(
          'business.reimbursement.department_not_found',
          'Department could not be resolved.'
        )
      );
    }

    if (department.organizationId.value !== request.organizationId) {
      return fail(
        new DomainError(
          'business.reimbursement.organization_mismatch',
          'Department does not belong to the requested organization.'
        )
      );
    }

    if (request.projectId === undefined) {
      return succeed({ request, department, project: undefined });
    }

    const project = await repositories.projects.findById(
      Identifier.create(request.projectId, 'project id')
    );

    if (project === undefined) {
      return fail(
        new DomainError(
          'business.reimbursement.project_not_found',
          'Project could not be resolved.'
        )
      );
    }

    if (!project.departmentId.equals(department.id)) {
      return fail(
        new DomainError(
          'business.reimbursement.project_department_mismatch',
          'Project must belong to the selected department.'
        )
      );
    }

    return succeed({ request, department, project });
  };

const submitClaim =
  (
    repositories: SubmitReimbursementClaimRepositories
  ): PipelineStage<
    ResolvedReimbursementRequestContext,
    ReimbursementClaimResultDto
  > =>
  async (context) => {
    const items = context.request.items.map((item) =>
      ExpenseItem.create(
        item.currency === undefined
          ? {
              description: item.description,
              amountMinorUnits: item.amountMinorUnits
            }
          : {
              description: item.description,
              amountMinorUnits: item.amountMinorUnits,
              currency: item.currency
            }
      )
    );
    const claimInput =
      context.project === undefined
        ? {
            id: `claim:${context.request.claimantId}:${Date.now().toString()}`,
            claimantId: context.request.claimantId,
            departmentId: context.department.id.value,
            items
          }
        : {
            id: `claim:${context.request.claimantId}:${Date.now().toString()}`,
            claimantId: context.request.claimantId,
            departmentId: context.department.id.value,
            projectId: context.project.id.value,
            items
          };
    const claim = ReimbursementClaim.submit(claimInput);

    await repositories.claims.save(claim);

    return succeed({
      claimId: claim.id.value,
      departmentId: claim.departmentId.value,
      projectId: claim.projectId?.value,
      totalMinorUnits: claim.total.minorUnits,
      currency: claim.total.currency,
      status: claim.status
    });
  };

export const createSubmitReimbursementClaimWorkflow = (
  repositories: SubmitReimbursementClaimRepositories
) =>
  Pipeline.start<ReimbursementRequestInput>()
    .pipe(validateInput)
    .pipe(resolveBusinessContext(repositories))
    .pipe(submitClaim(repositories));
