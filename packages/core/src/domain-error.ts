export class DomainError extends Error {
  public constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export const failInvariant = (code: string, message: string): never => {
  throw new DomainError(code, message);
};
