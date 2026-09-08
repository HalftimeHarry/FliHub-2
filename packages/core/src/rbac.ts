/**
 * Role-based access control (RBAC) primitives, adapted from the FLI-Golf/FliHub
 * "Business OS" permission model (`resource:action:scope` strings).
 */

export type UserRole =
  | 'leader'
  | 'admin'
  | 'business_staff'
  | 'manager'
  | 'player'
  | 'vendor'
  | 'broadcaster';

export type Action = 'read' | 'write' | 'delete' | 'approve' | 'register' | '*';

export type Scope = 'all' | 'own' | 'organization';

/**
 * Permission format: "resource:action:scope" (scope optional, defaults to all).
 * Examples:
 * - "league:*" — all actions on league resources
 * - "business:read" — read business resources
 * - "tournaments:register:own" — register oneself for tournaments
 * - "*" — all permissions
 */
export type Permission = string;

export const ROLE_PERMISSIONS: Readonly<Record<UserRole, readonly Permission[]>> = {
  leader: ['*'],
  admin: [
    'users:*',
    'league:*',
    'business:*',
    'organization:*',
    'sponsorship:*',
    'community:*',
    'fantasy:*'
  ],
  business_staff: [
    'business:*',
    'organization:read',
    'league:read',
    'sponsorship:read'
  ],
  manager: [
    'league:read',
    'league:write:own',
    'players:read:organization',
    'players:write:organization',
    'profile:*:own'
  ],
  player: [
    'league:read',
    'tournaments:register:own',
    'profile:*:own'
  ],
  vendor: [
    'sponsorship:read:own',
    'sponsorship:write:own',
    'contracts:read:own',
    'profile:*:own'
  ],
  broadcaster: [
    'league:read',
    'tournaments:read',
    'players:read',
    'profile:*:own'
  ]
};

const permissionMatches = (
  granted: Permission,
  resource: string,
  action: Action,
  scope: Scope
): boolean => {
  if (granted === '*') {
    return true;
  }

  const [grantedResource, grantedAction = 'read', grantedScope = 'all'] =
    granted.split(':');

  if (grantedResource !== resource && grantedResource !== '*') {
    return false;
  }

  if (grantedAction !== '*' && grantedAction !== action) {
    return false;
  }

  // A grant without a scope covers every scope; a scoped grant only matches
  // the same scope.
  if (grantedScope === 'all') {
    return true;
  }

  return grantedScope === scope;
};

export const hasPermission = (
  role: UserRole,
  resource: string,
  action: Action = 'read',
  scope: Scope = 'all'
): boolean =>
  ROLE_PERMISSIONS[role].some((granted) =>
    permissionMatches(granted, resource, action, scope)
  );

export const ROLE_LABELS: Readonly<Record<UserRole, string>> = {
  leader: 'Leader',
  admin: 'Administrator',
  business_staff: 'Business staff',
  manager: 'Manager',
  player: 'Player',
  vendor: 'Vendor',
  broadcaster: 'Broadcaster'
};
