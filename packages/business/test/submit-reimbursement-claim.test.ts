import { describe, expect, it } from 'vitest';
import {
  createSubmitReimbursementClaimWorkflow,
  Department,
  InMemoryDepartmentRepository,
  InMemoryProjectRepository,
  InMemoryReimbursementClaimRepository,
  Project
} from '@flihub/business';

describe('createSubmitReimbursementClaimWorkflow', () => {
  it('submits a reimbursement claim and calculates the total', async () => {
    const workflow = createSubmitReimbursementClaimWorkflow({
      departments: new InMemoryDepartmentRepository([
        Department.create({
          id: 'department-1',
          organizationId: 'fgl',
          name: 'Operations'
        })
      ]),
      projects: new InMemoryProjectRepository([
        Project.create({
          id: 'project-1',
          departmentId: 'department-1',
          name: 'Tournament Launch'
        })
      ]),
      claims: new InMemoryReimbursementClaimRepository()
    });

    const result = await workflow.execute({
      organizationId: 'fgl',
      claimantId: 'staff-1',
      departmentId: 'department-1',
      projectId: 'project-1',
      items: [
        {
          description: 'Court supplies',
          amountMinorUnits: 4250,
          currency: 'USD'
        },
        {
          description: 'Officials parking',
          amountMinorUnits: 1750,
          currency: 'USD'
        }
      ]
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.totalMinorUnits).toBe(6000);
      expect(result.value.status).toBe('submitted');
      expect(result.value.projectId).toBe('project-1');
    }
  });

  it('rejects projects outside the selected department', async () => {
    const workflow = createSubmitReimbursementClaimWorkflow({
      departments: new InMemoryDepartmentRepository([
        Department.create({
          id: 'department-1',
          organizationId: 'fgl',
          name: 'Operations'
        })
      ]),
      projects: new InMemoryProjectRepository([
        Project.create({
          id: 'project-1',
          departmentId: 'department-2',
          name: 'Media Campaign'
        })
      ]),
      claims: new InMemoryReimbursementClaimRepository()
    });

    const result = await workflow.execute({
      organizationId: 'fgl',
      claimantId: 'staff-1',
      departmentId: 'department-1',
      projectId: 'project-1',
      items: [
        {
          description: 'Court supplies',
          amountMinorUnits: 4250,
          currency: 'USD'
        }
      ]
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(
        'business.reimbursement.project_department_mismatch'
      );
    }
  });
});
