import { DomainError } from '@flihub/core';
import { fail, succeed, type WorkflowResult } from './result.js';

export type PipelineStage<Input, Output> = (
  input: Input
) => Promise<WorkflowResult<Output>> | WorkflowResult<Output>;

type UnknownStage = (
  input: unknown
) => Promise<WorkflowResult<unknown>> | WorkflowResult<unknown>;

export class Pipeline<Input, Output = Input> {
  private constructor(private readonly stages: readonly UnknownStage[]) {}

  public static start<Input>(): Pipeline<Input, Input> {
    return new Pipeline<Input, Input>([]);
  }

  public pipe<NextOutput>(
    stage: PipelineStage<Output, NextOutput>
  ): Pipeline<Input, NextOutput> {
    return new Pipeline<Input, NextOutput>([
      ...this.stages,
      stage as UnknownStage
    ]);
  }

  public async execute(input: Input): Promise<WorkflowResult<Output>> {
    let current: unknown = input;

    for (const stage of this.stages) {
      const result = await stage(current);

      if (!result.success) {
        return fail(result.error);
      }

      current = result.value;
    }

    return succeed(current as Output);
  }
}

export const unexpectedWorkflowError = (
  workflowName: string,
  error: unknown
): DomainError => {
  if (error instanceof DomainError) {
    return error;
  }

  return new DomainError(
    'workflow.unexpected_error',
    `${workflowName} failed unexpectedly.`
  );
};
