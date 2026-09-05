import { describe, expect, it } from 'vitest';
import { DomainError } from '@flihub/core';
import { fail, Pipeline, succeed } from '@flihub/workflows';

describe('Pipeline', () => {
  it('preserves values between typed async stages', async () => {
    const workflow = Pipeline.start<{ value: number }>()
      .pipe((input) => succeed(input.value + 1))
      .pipe((input) => succeed({ label: `score-${input.toString()}` }));

    const result = await workflow.execute({ value: 41 });

    expect(result).toEqual({ success: true, value: { label: 'score-42' } });
  });

  it('stops at predictable failures', async () => {
    const workflow = Pipeline.start<string>()
      .pipe(() => fail(new DomainError('test.failure', 'Expected failure.')))
      .pipe(() => succeed('unreachable'));

    const result = await workflow.execute('input');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('test.failure');
    }
  });
});
