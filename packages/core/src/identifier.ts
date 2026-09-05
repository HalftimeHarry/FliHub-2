import { DomainError } from './domain-error.js';

export class Identifier {
  private constructor(public readonly value: string) {}

  public static create(value: string, label = 'identifier'): Identifier {
    const normalizedValue = value.trim();

    if (normalizedValue.length === 0) {
      throw new DomainError(
        'core.identifier.empty',
        `${label} must not be empty.`
      );
    }

    return new Identifier(normalizedValue);
  }

  public equals(other: Identifier): boolean {
    return this.value === other.value;
  }
}
