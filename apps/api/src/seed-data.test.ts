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

  it('uses a full 12-tournament 2027 schedule with valid season, date, and venue mappings', async () => {
    const repositories = createLeagueRepositories();
    const tournaments = await repositories.tournaments.list();
    const fglTournaments = tournaments.filter(
      (tournament) => tournament.organizationId.value === 'fgl'
    );
    const summer = fglTournaments.filter(
      (tournament) => tournament.seasonId.value === 'summer-2027'
    );
    const fall = fglTournaments.filter(
      (tournament) => tournament.seasonId.value === 'fall-2027'
    );

    expect(summer).toHaveLength(6);
    expect(fall).toHaveLength(6);
    expect(
      summer.map((tournament) => tournament.name)
    ).toEqual([
      'Summer Season • June 2 at Turf Paradise',
      'Summer Season • June 16 at Turf Paradise',
      'Summer Season • June 30 at Turf Paradise',
      'Summer Season • July 14 at Arizona Athletic Grounds',
      'Summer Season • July 28 at Arizona Athletic Grounds',
      'Summer Season • August 11 at Arizona Athletic Grounds'
    ]);
    expect(
      fall.map((tournament) => tournament.name)
    ).toEqual([
      'Fall Season • September 16 at Turf Paradise',
      'Fall Season • September 30 at Arizona Athletic Grounds',
      'Fall Season • October 14 at Turf Paradise',
      'Fall Season • October 28 at Arizona Athletic Grounds',
      'Fall Season • November 11 at Turf Paradise',
      'Fall Season • December 9 at Arizona Athletic Grounds'
    ]);

    const seasonById = new Map(
      (await repositories.seasons.list()).map((season) => [season.id.value, season])
    );
    const courses = await repositories.courses.list();
    for (const tournament of fglTournaments) {
      const season = seasonById.get(tournament.seasonId.value);
      expect(season).toBeDefined();
      expect(tournament.scheduledOn).toBeDefined();
      expect(tournament.courseId).toBeDefined();
      expect(tournament.scheduledOn!.getTime()).toBeGreaterThanOrEqual(
        season!.dateRange.startsOn.getTime()
      );
      expect(tournament.scheduledOn!.getTime()).toBeLessThanOrEqual(
        season!.dateRange.endsOn.getTime()
      );
      const course = courses.find((entry) => entry.id.value === tournament.courseId!.value);
      expect(course).toBeDefined();
      expect(['course-1', 'course-2']).toContain(course!.id.value);
    }
  });
});
