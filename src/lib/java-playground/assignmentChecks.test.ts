import { describe, expect, it } from 'vitest';
import { outputMatchesPattern } from './compareOutput';
import { assertPublicMain } from './sourceChecks';
import { getExercise } from './exercises';

describe('assertPublicMain with a named entry class', () => {
  const helloTeam = 'public class HelloTeam {\n  public static void main(String[] args) {}\n}\n';

  it('accepts the class the assignment asks for', () => {
    expect(assertPublicMain(helloTeam, 'HelloTeam')).toBeNull();
  });

  it('names the expected class when the student used another one', () => {
    const message = assertPublicMain('public class Main {\n  public static void main(String[] a) {}\n}', 'HelloTeam');
    expect(message).toContain('HelloTeam');
    expect(message).toContain('found Main');
  });

  it('still defaults to Main for lesson playgrounds', () => {
    expect(assertPublicMain(helloTeam)).toContain('Main');
    expect(assertPublicMain('public class Main {\n  public static void main(String[] a) {}\n}')).toBeNull();
  });

  it('asks for a main method when the class is right but empty', () => {
    expect(assertPublicMain('public class HelloTeam {\n}\n', 'HelloTeam')).toContain('main method');
  });
});

describe('pattern tests', () => {
  const shape = '^Name: [^\\n]+\\nTeam: [^\\n]+\\nRole: [^\\n]+\\nReady to build\\.$';
  const noPlaceholders = '^[^<>]*$';

  it('accepts any student who filled the lines in', () => {
    const out = 'Name: Ada Lovelace\nTeam: 4451 Bearcat Robotics\nRole: Programming\nReady to build.\n';
    expect(outputMatchesPattern(out, shape)).toBe(true);
    expect(outputMatchesPattern(out, noPlaceholders)).toBe(true);
  });

  it('rejects a missing or misspelled final line', () => {
    expect(
      outputMatchesPattern('Name: A\nTeam: B\nRole: C\n', shape),
    ).toBe(false);
    expect(
      outputMatchesPattern('Name: A\nTeam: B\nRole: C\nReady to build\n', shape),
    ).toBe(false);
  });

  it('rejects an unfilled placeholder', () => {
    const out = 'Name: <your name>\nTeam: 4451\nRole: Programming\nReady to build.';
    expect(outputMatchesPattern(out, shape)).toBe(true);
    expect(outputMatchesPattern(out, noPlaceholders)).toBe(false);
  });

  it('tolerates the trailing newline and Windows line endings the runner normalizes', () => {
    const out = 'Name: A\r\nTeam: B\r\nRole: C\r\nReady to build.\r\n\r\n';
    expect(outputMatchesPattern(out, shape)).toBe(true);
  });
});

describe('a01-hello-team', () => {
  it('is registered and names its own class', () => {
    const exercise = getExercise('a01-hello-team');
    expect(exercise?.entryClass).toBe('HelloTeam');
    expect(exercise?.starter).toContain('public class HelloTeam');
  });

  it('ships a starter that does not already pass', () => {
    const exercise = getExercise('a01-hello-team')!;
    for (const test of exercise.tests) {
      if (test.name === 'Four lines in the right shape') {
        expect(outputMatchesPattern('', test.pattern!)).toBe(false);
      }
    }
  });
});
