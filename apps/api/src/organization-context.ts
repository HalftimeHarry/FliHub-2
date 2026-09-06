import type { NextFunction, Request, Response } from 'express';
import type { MockUser } from './mock-users.js';

export interface OrganizationRequest extends Request {
  readonly organizationId: string;
  readonly userId: string;
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
      }
    });
    next();
  };
