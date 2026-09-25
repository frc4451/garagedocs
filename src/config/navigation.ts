export type SectionId = 'tools' | 'hardware' | 'java' | 'assignments' | 'kit-bot' | 'frc' | 'badges';

export type AppRouteId = 'resources' | 'references';

export interface NavSection {
  id: SectionId;
  label: string;
  path: string;
  collection: SectionId;
  /** Breadcrumb text; defaults to `<label> Training`. */
  breadcrumbLabel?: string;
  underConstruction?: boolean;
}

export interface AppRoute {
  id: AppRouteId;
  label: string;
  path: string;
}

export const sections: NavSection[] = [
  // General technical skills (shell, Git) come first: they are day-one, before any code.
  { id: 'tools', label: 'Tools', path: '/tools', collection: 'tools', breadcrumbLabel: 'Tools' },
  { id: 'hardware', label: 'Hardware', path: '/hardware', collection: 'hardware', breadcrumbLabel: 'Hardware' },
  { id: 'java', label: 'Java', path: '/java', collection: 'java', breadcrumbLabel: 'Java' },
  {
    id: 'kit-bot',
    label: 'Kit Bot',
    path: '/kit-bot',
    collection: 'kit-bot',
    breadcrumbLabel: 'Kit Bot',
  },
  { id: 'frc', label: 'FRC', path: '/frc', collection: 'frc' },
  // Badges map the other sections onto the team's year-by-year sign-off sheets.
  { id: 'badges', label: 'Badges', path: '/badges', collection: 'badges', breadcrumbLabel: 'Badges' },
];

export const appRoutes: AppRoute[] = [
  { id: 'resources', label: 'Resources', path: '/resources' },
  { id: 'references', label: 'References', path: '/references' },
];

export const siteConfig = {
  title: 'GarageDocs | FRC 4451 Programming Training',
  description:
    'Programming lessons, reference material, and interactive tools for FIRST Robotics students and mentors.',
  /** Deployment origin; set from `site` in astro.config.mjs. */
  url: import.meta.env.SITE ?? 'https://frc4451.github.io',
  author: 'FRC 4451 ROBOTZ Garage',
  github: 'https://github.com/frc4451/garagedocs',
  /** The project this site was forked from; credited on the References page and in NOTICE. */
  upstream: 'https://github.com/itkan-robotics/mantik',
  brand: {
    favicon: '/media/robotz-garage-favicon.png',
    teamLogo: '/media/robotz-garage-team-logo.png',
    ogImage: '/media/robotz-garage-team-logo.png',
  },
};

export function sectionFromPath(pathname: string): SectionId | null {
  const match = pathname.match(/^\/(tools|hardware|java|kit-bot|frc|badges)/);
  return match ? (match[1] as SectionId) : null;
}

export function lessonUrl(section: SectionId, lessonId: string): string {
  if (lessonId === 'overview') {
    if (section === 'assignments') return '/java/assignments';
    return `/${section}`;
  }
  if (section === 'java') return `/java/fundamentals/${javaLessonSlug(lessonId)}`;
  if (section === 'assignments') return `/java/assignments/${lessonId}`;
  return `/${section}/${lessonId}`;
}

/** Keep Java lesson ids stable while avoiding a repeated `java-` prefix in public URLs. */
export function javaLessonSlug(lessonId: string): string {
  return lessonId.startsWith('java-') ? lessonId.slice('java-'.length) : lessonId;
}
