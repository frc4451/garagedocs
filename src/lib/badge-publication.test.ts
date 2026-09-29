import { describe, expect, it } from 'vitest';
import { isBadgeWorkInProgress, publishedBadgeData } from './badge-publication';

describe('badge publication', () => {
  it.each(['badge-3', 'badge-3-maple', 'badge-3-written-checks'])(
    'hides %s only outside development', (id) => {
      expect(isBadgeWorkInProgress('badges', id, false)).toBe(true);
      expect(isBadgeWorkInProgress('badges', id, true)).toBe(false);
    },
  );

  it('leaves other badges and sections available', () => {
    for (const id of ['overview', 'badge-1', 'badge-1-hardware', 'badge-2', 'badge-2-hardware', 'badge-20', 'badge-30']) {
      expect(isBadgeWorkInProgress('badges', id, false)).toBe(false);
    }
    expect(isBadgeWorkInProgress('frc', 'badge-2', false)).toBe(false);
  });

  it('preserves Badge 2 metadata in the public build', () => {
    for (const lessonId of ['badge-2', 'badge-2-hardware', 'badge-2-sign-off']) {
      const source = {
        lessonId, title: 'Published curriculum', description: 'Student lesson',
        difficulty: 'advanced', unlisted: false,
      };
      expect(publishedBadgeData('badges', source, false)).toBe(source);
    }
  });

  it('keeps only each placeholder in navigation without mutating source metadata', () => {
    const source = {
      lessonId: 'badge-3-hardware', title: 'Hardware Setup', description: 'Draft curriculum',
      difficulty: 'advanced', duration: '2 hours', unlisted: false,
    };
    expect(publishedBadgeData('badges', source, false)).toEqual({
      ...source, title: 'Work In Progress', description: 'This badge curriculum is being revised.',
      difficulty: undefined, duration: undefined, unlisted: true,
    });
    expect(source.title).toBe('Hardware Setup');
    expect(source.unlisted).toBe(false);
    expect(publishedBadgeData('badges', source, true)).toBe(source);
    for (const lessonId of ['badge-3']) {
      expect(publishedBadgeData('badges', { ...source, lessonId }, false).unlisted).toBe(false);
    }
  });
});
