import { DomainError } from '@flihub/core';

export type WorkflowResult<Value, ErrorType extends DomainError = DomainError> =
  | { readonly success: true; readonly value: Value }
  | { readonly success: false; readonly error: ErrorType };

export const succeed = <Value>(value: Value): WorkflowResult<Value> => ({
  success: true,
  value
});

export const fail = <ErrorType extends DomainError>(
  error: ErrorType
): WorkflowResult<never, ErrorType> => ({
  success: false,
  error
});
