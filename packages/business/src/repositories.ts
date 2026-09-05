import { Identifier } from '@flihub/core';
import { InMemoryRepository } from '@flihub/persistence';
import type { Department } from './department.js';
import type { Project } from './project.js';
import type { ReimbursementClaim } from './reimbursement-claim.js';

export interface DepartmentRepository {
  findById(id: Identifier): Promise<Department | undefined>;
  list(): Promise<readonly Department[]>;
}

export interface ProjectRepository {
  findById(id: Identifier): Promise<Project | undefined>;
  list(): Promise<readonly Project[]>;
}

export interface ReimbursementClaimRepository {
  save(claim: ReimbursementClaim): Promise<void>;
  list(): Promise<readonly ReimbursementClaim[]>;
}

export class InMemoryDepartmentRepository
  extends InMemoryRepository<Department>
  implements DepartmentRepository {}

export class InMemoryProjectRepository
  extends InMemoryRepository<Project>
  implements ProjectRepository {}

export class InMemoryReimbursementClaimRepository
  extends InMemoryRepository<ReimbursementClaim>
  implements ReimbursementClaimRepository {}
