import { describe, expect, it } from 'vitest';
import { createLeagueRepositories } from './seed-data.js';

describe('default seed data', () => {
  it('uses the basic 18-hole FLI example courses without the demo turf layout', async () => {
    const repositories = createLeagueRepositories();
    const courses = await repositories.courses.list();
    const holes = await repositories.holes.list();

    expect(
      courses
        .filter((course) => course.organizationId.value === 'fgl')
        .map((course) => course.name)
    ).toEqual(['Maple Ridge', 'Harbor Point']);
    expect(holes.filter((hole) => hole.courseId.value === 'course-4')).toHaveLength(0);
    expect(holes.filter((hole) => hole.courseId.value === 'course-3')).toHaveLength(0);

    const mapleRidgeHoles = holes.filter((hole) => hole.courseId.value === 'course-1');
    expect(mapleRidgeHoles).toHaveLength(18);
    expect(mapleRidgeHoles[0]?.par).toBe(3);
    expect(mapleRidgeHoles[1]?.par).toBe(4);
    expect(mapleRidgeHoles[2]?.par).toBe(5);
    expect(mapleRidgeHoles[17]?.number).toBe(18);
  });
});
