import { describe, expect, it } from 'vitest';
import { DomainError, Money, Organization } from '@flihub/core';

describe('core domain objects', () => {
  it('normalizes valid organization identity and name', () => {
    const organization = Organization.create({ id: ' fgl ', name: ' FGL ' });

    expect(organization.id.value).toBe('fgl');
    expect(organization.name).toBe('FGL');
    expect(organization.type).toBe('school');
    expect(organization.paysTeams).toBe(false);
  });

  it('supports an operator organization that pays teams', () => {
    const organization = Organization.create({
      id: 'fli-golf',
      name: 'FLI Golf',
      type: 'operator',
      paysTeams: true
    });

    expect(organization.type).toBe('operator');
    expect(organization.paysTeams).toBe(true);
  });

  it('uses basic league components when no setup is supplied', () => {
    const organization = Organization.create({
      id: 'school-1',
      name: 'Example School'
    });

    expect(organization.hasComponent('league-operations')).toBe(true);
    expect(organization.hasComponent('courses-and-scoring')).toBe(true);
    expect(organization.hasComponent('fantasy')).toBe(false);
    expect(organization.hasComponent('payouts')).toBe(false);
  });

  it('prevents adding money across currencies', () => {
    const usd = Money.fromMinorUnits(1000, 'usd');
    const cad = Money.fromMinorUnits(1000, 'cad');

    expect(() => usd.add(cad)).toThrow(DomainError);
  });
});
