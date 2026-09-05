import { describe, expect, it } from 'vitest';
import { DomainError, Money, Organization } from '@flihub/core';

describe('core domain objects', () => {
  it('normalizes valid organization identity and name', () => {
    const organization = Organization.create({ id: ' fgl ', name: ' FGL ' });

    expect(organization.id.value).toBe('fgl');
    expect(organization.name).toBe('FGL');
  });

  it('prevents adding money across currencies', () => {
    const usd = Money.fromMinorUnits(1000, 'usd');
    const cad = Money.fromMinorUnits(1000, 'cad');

    expect(() => usd.add(cad)).toThrow(DomainError);
  });
});
