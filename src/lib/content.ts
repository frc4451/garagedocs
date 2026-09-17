import { getCollection, type CollectionEntry } from 'astro:content';
import type { SectionId } from '@/config/navigation';

export type LessonEntry = CollectionEntry<'tools' | 'hardware' | 'java' | 'assignments' | 'kit-bot' | 'frc' | 'badges'>;

export interface SidebarGroup {
  id: string;
  label: string;
  partLabel?: string;
  /** Render the items as a flat list under the part label, with no collapse toggle. */
  flat?: boolean;
  items: SidebarItem[];
}

export interface SidebarItem {
  lessonId: string;
  label: string;
  href: string;
  difficulty?: string;
  duration?: string;
}

export async function getSectionLessons(section: SectionId): Promise<LessonEntry[]> {
  const lessons = await getCollection(section, ({ data }) => !data.draft);
  return lessons.sort((a, b) => {
    const groupOrder = (a.data.groupOrder ?? 0) - (b.data.groupOrder ?? 0);
    if (groupOrder !== 0) return groupOrder;
    return a.data.order - b.data.order;
  });
}

export async function getSidebarGroups(section: SectionId): Promise<SidebarGroup[]> {
  const lessons = await getSectionLessons(section);
  // `unlisted` lessons still build a page, but are absent from the sidebar — and
  // therefore from prev/next, which is derived from these groups.
  const contentLessons = lessons.filter((l) => !l.data.isOverview && !l.data.unlisted);

  const groups = new Map<string, SidebarGroup>();

  for (const lesson of contentLessons) {
    const groupId = lesson.data.group ?? 'general';
    const groupLabel = lesson.data.groupLabel ?? 'General';

    if (!groups.has(groupId)) {
      groups.set(groupId, { id: groupId, label: groupLabel, items: [] });
    }

    groups.get(groupId)!.items.push({
      lessonId: lesson.data.lessonId,
      label: lesson.data.title,
      href: lesson.data.lessonId === 'overview' ? `/${section}` : `/${section}/${lesson.data.lessonId}`,
      difficulty: lesson.data.difficulty,
      duration: lesson.data.duration,
    });
  }

  const result = Array.from(groups.values());
  if (FLAT_SECTIONS.has(section)) {
    // Badges read as a list of lists: each badge is a part heading over its steps.
    for (const group of result) {
      group.partLabel = group.label;
      group.flat = true;
    }
  }
  if (section === 'frc') {
    for (const group of result) {
      group.partLabel = FRC_PART_LABELS[group.id];
    }
  }
  return result;
}

/** Sections whose sidebar groups render flat (a heading and a list) instead of as collapsible groups. */
const FLAT_SECTIONS: ReadonlySet<SectionId> = new Set<SectionId>(['badges']);

/** Broad lecture parts shown above the first FRC module in each part. */
const FRC_PART_LABELS: Readonly<Record<string, string>> = {
  'frc-environment-setup': 'Part 1: Foundations',
  'frc-cobra': 'Part 2: From Kit Bot to Competition Code',
  'frc-runtime-and-io': 'Part 3: IO, Simulation, and Debugging',
  'frc-control-theory': 'Part 4: Mechanism Control',
  'frc-pose-foundations': 'Part 5: Pose and Competition Architecture',
  'frc-autonomous': 'Part 6: Autonomous and Robot Coordination',
};

function remapSidebarGroups(
  groups: SidebarGroup[],
  prefix: string,
  partLabel: string,
): SidebarGroup[] {
  return groups.map((group, index) => ({
    ...group,
    partLabel: index === 0 ? partLabel : undefined,
    items: group.items.map((item) => ({
      ...item,
      href: `${prefix}/${item.lessonId}`,
    })),
  }));
}

export async function getJavaSidebarGroups(): Promise<SidebarGroup[]> {
  const fundamentals = remapSidebarGroups(
    await getSidebarGroups('java'),
    '/java/fundamentals',
    'Part 1: Java Fundamentals',
  );
  const assignments = remapSidebarGroups(
    await getSidebarGroups('assignments'),
    '/java/assignments',
    'Part 2: Practice Assignments',
  );
  return [...fundamentals, ...assignments];
}

export function getAdjacentFromGroups(
  groups: SidebarGroup[],
  lessonId: string,
): { prev?: SidebarItem; next?: SidebarItem } {
  const flat = groups.flatMap((group) => group.items);
  const index = flat.findIndex((item) => item.lessonId === lessonId);
  return {
    prev: index > 0 ? flat[index - 1] : undefined,
    next: index >= 0 && index < flat.length - 1 ? flat[index + 1] : undefined,
  };
}

export async function getOverview(section: SectionId): Promise<LessonEntry | undefined> {
  const lessons = await getSectionLessons(section);
  return lessons.find((l) => l.data.isOverview || l.data.lessonId === 'overview');
}

export async function getLesson(
  section: SectionId,
  lessonId: string,
): Promise<LessonEntry | undefined> {
  const lessons = await getSectionLessons(section);
  return lessons.find((l) => l.data.lessonId === lessonId);
}

export async function getAdjacentLessons(
  section: SectionId,
  lessonId: string,
): Promise<{ prev?: SidebarItem; next?: SidebarItem }> {
  const groups = await getSidebarGroups(section);
  return getAdjacentFromGroups(groups, lessonId);
}
