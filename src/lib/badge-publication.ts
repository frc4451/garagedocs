// Remove a badge from this set when its curriculum is ready to publish.
const unpublishedBadges = new Set<string>([]);

// Published badges whose pilot is still open; their pages carry a pilot notice. Remove a badge
// from this set when its validation gates close.
const pilotBadges = new Set(['badge-3']);

function belongsTo(badges: Set<string>, lessonId: string): boolean {
  return [...badges].some((badge) => lessonId === badge || lessonId.startsWith(`${badge}-`));
}

export function isBadgeWorkInProgress(
  section: string,
  lessonId: string,
  development = import.meta.env.DEV,
): boolean {
  if (development || section !== 'badges') return false;
  return belongsTo(unpublishedBadges, lessonId);
}

export function isBadgeInPilot(section: string, lessonId: string): boolean {
  return section === 'badges' && belongsTo(pilotBadges, lessonId);
}

interface PublicationData {
  lessonId: string;
  title: string;
  description?: string;
  difficulty?: string;
  duration?: string;
  unlisted?: boolean;
}

export function publishedBadgeData<T extends PublicationData>(
  section: string,
  data: T,
  development = import.meta.env.DEV,
): T {
  if (!isBadgeWorkInProgress(section, data.lessonId, development)) return data;
  return {
    ...data,
    title: 'Work In Progress',
    description: 'This badge curriculum is being revised.',
    difficulty: undefined,
    duration: undefined,
    unlisted: !unpublishedBadges.has(data.lessonId),
  };
}
