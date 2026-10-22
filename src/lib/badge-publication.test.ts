import { describe, expect, it } from 'vitest';
import { isBadgeInPilot, isBadgeWorkInProgress, publishedBadgeData } from './badge-publication';

describe('badge publication', () => {
  it('publishes every badge in the public build', () => {
    for (const id of ['overview', 'badge-1', 'badge-1-hardware', 'badge-2', 'badge-2-hardware',
      'badge-3', 'badge-3-maple', 'badge-3-written-checks', 'badge-20', 'badge-30']) {
      expect(isBadgeWorkInProgress('badges', id, false)).toBe(false);
    }
    expect(isBadgeWorkInProgress('frc', 'badge-2', false)).toBe(false);
  });

  it.each(['badge-3', 'badge-3-maple', 'badge-3-written-checks'])(
    'marks %s as in its pilot', (id) => {
      expect(isBadgeInPilot('badges', id)).toBe(true);
    },
  );

  it('leaves other badges, look-alike ids and other sections out of the pilot', () => {
    for (const id of ['overview', 'badge-1', 'badge-2-hardware', 'badge-30', 'badge-3x']) {
      expect(isBadgeInPilot('badges', id)).toBe(false);
    }
    expect(isBadgeInPilot('frc', 'badge-3')).toBe(false);
  });

  it('preserves published badge metadata in the public build', () => {
    for (const lessonId of ['badge-2', 'badge-2-hardware', 'badge-3', 'badge-3-sign-off']) {
      const source = {
        lessonId, title: 'Published curriculum', description: 'Student lesson',
        difficulty: 'advanced', unlisted: false,
      };
      expect(publishedBadgeData('badges', source, false)).toBe(source);
    }
  });
});
