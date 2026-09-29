// Remove a badge from this set when its curriculum is ready to publish.
const unpublishedBadges = new Set(['badge-3']);

export function isBadgeWorkInProgress(
  section: string,
  lessonId: string,
  development = import.meta.env.DEV,
): boolean {
  if (development || section !== 'badges') return false;
  return [...unpublishedBadges].some((badge) => lessonId === badge || lessonId.startsWith(`${badge}-`));
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
