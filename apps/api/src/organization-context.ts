import type { NextFunction, Request, Response } from 'express';
import { hasPermission, type Action, type Scope, type UserRole } from '@flihub/core';
import type { MockUser } from './mock-users.js';

export interface OrganizationRequest extends Request {
  readonly organizationId: string;
  readonly userId: string;
  readonly userRole: UserRole;
}

export const createOrganizationContextMiddleware =
  (users: readonly MockUser[]) =>
  (request: Request, response: Response, next: NextFunction): void => {
    const userId = request.header('x-user-id')?.trim();
    const user = users.find((candidate) => candidate.id === userId);

    if (userId === undefined || user === undefined) {
      response.status(401).json({
        code: 'authentication.required',
        message: 'A valid x-user-id header is required.'
      });
      return;
    }

    Object.defineProperties(request, {
      organizationId: {
        configurable: false,
        enumerable: true,
        value: user.organizationId,
        writable: false
      },
      userId: {
        configurable: false,
        enumerable: true,
        value: user.id,
        writable: false
      },
      userRole: {
        configurable: false,
        enumerable: true,
        value: user.role,
        writable: false
      }
    });
    next();
  };

/**
 * Adapted from FLI-Golf/FliHub's PermissionGuard: require the caller's role to
 * hold the given resource permission before reaching the handler.
 */
export const requirePermission =
  (resource: string, action: Action = 'read', scope: Scope = 'all') =>
  (request: Request, response: Response, next: NextFunction): void => {
    const role = (request as Partial<OrganizationRequest>).userRole;

    if (role === undefined || !hasPermission(role, resource, action, scope)) {
      response.status(403).json({
        code: 'authorization.forbidden',
        message: `Your role cannot ${action} ${resource}.`
      });
      return;
    }

    next();
  };
