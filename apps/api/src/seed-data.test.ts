import { describe, expect, it } from 'vitest';
import { createLeagueRepositories } from './seed-data.js';

describe('default seed data', () => {
  it('uses the new nine-hole demo courses for the default FGL organization', async () => {
    const repositories = createLeagueRepositories();
    const courses = await repositories.courses.list();
    const holes = await repositories.holes.list();

    expect(
      courses
        .filter((course) => course.organizationId.value === 'fgl')
        .map((course) => course.name)
    ).toEqual(['Turf Paradise', 'Arizona Athletic Grounds']);

    const turfParadise = courses.find((course) => course.id.value === 'course-1');
    const arizonaAthleticGrounds = courses.find(
      (course) => course.id.value === 'course-2'
    );

    expect(turfParadise?.holeCount).toBe(9);
    expect(arizonaAthleticGrounds?.holeCount).toBe(9);

    const turfHoles = holes.filter((hole) => hole.courseId.value === 'course-1');
    const arizonaHoles = holes.filter((hole) => hole.courseId.value === 'course-2');

    expect(turfHoles).toHaveLength(18);
    expect(arizonaHoles).toHaveLength(18);
    expect(turfHoles.every((hole) => hole.par === 3)).toBe(true);
    expect(arizonaHoles.every((hole) => hole.par === 3)).toBe(true);
    expect(turfHoles.every((hole) => hole.distanceFeet !== undefined && hole.distanceFeet >= 215 && hole.distanceFeet <= 425)).toBe(true);
    expect(arizonaHoles.every((hole) => hole.distanceFeet !== undefined && hole.distanceFeet >= 225 && hole.distanceFeet <= 425)).toBe(true);
    expect(turfHoles.slice(0, 9).every((hole) => hole.blueBasket === true)).toBe(true);
    expect(turfHoles.slice(9).every((hole) => hole.blueBasket === false)).toBe(true);
    expect(arizonaHoles.slice(0, 9).every((hole) => hole.blueBasket === true)).toBe(true);
    expect(arizonaHoles.slice(9).every((hole) => hole.blueBasket === false)).toBe(true);
    expect(turfHoles[8]?.number).toBe(9);
    expect(turfHoles[9]?.number).toBe(10);
    expect(arizonaHoles[8]?.number).toBe(9);
    expect(arizonaHoles[9]?.number).toBe(10);
  });
});
