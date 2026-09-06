import { describe, expect, it } from 'vitest';
import {
  getOrganizationCatalog,
  registerCustomOrganization
} from './api.js';

const createStorage = () => {
  let map = new Map<string, string>();

  return {
    getItem: (key: string) => (map.has(key) ? map.get(key)! : null),
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
    clear: () => {
      map = new Map();
    }
  } as Storage;
};

describe('organization catalog', () => {
  it('keeps seeded organizations and adds a registered custom organization', () => {
    const storage = createStorage();

    const customOrganization = registerCustomOrganization(
      {
        name: 'Hawks Valley Academy',
        enabledComponents: [
          'league-operations',
          'fli-golf-format',
          'teams-and-rosters',
          'courses-and-scoring'
        ]
      },
      storage
    );

    const catalog = getOrganizationCatalog(storage);

    expect(customOrganization.id).toBe('hawks-valley-academy');
    expect(catalog.some((organization) => organization.id === 'hawks-valley-academy')).toBe(true);
    expect(catalog.some((organization) => organization.name === 'FLI Golf')).toBe(true);
  });
});
