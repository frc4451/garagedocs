export type SectionId = 'tools' | 'java' | 'assignments' | 'kit-bot' | 'frc';

export type AppRouteId = 'resources';

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
  { id: 'java', label: 'Java', path: '/java', collection: 'java' },
  {
    id: 'assignments',
    label: 'Practice',
    path: '/assignments',
    collection: 'assignments',
    breadcrumbLabel: 'Practice Assignments',
  },
  {
    id: 'kit-bot',
    label: 'Kit Bot',
    path: '/kit-bot',
    collection: 'kit-bot',
    breadcrumbLabel: 'Kit Bot',
  },
  { id: 'frc', label: 'FRC', path: '/frc', collection: 'frc' },
];

export const appRoutes: AppRoute[] = [
  { id: 'resources', label: 'Resources', path: '/resources' },
];

export const siteConfig = {
  title: 'Mantik Garage | FIRST Robotics Programming',
  description:
    'Programming lessons, reference material, and interactive tools for FIRST Robotics students and mentors.',
  /** Deployment origin; set from `site` in astro.config.mjs. */
  url: import.meta.env.SITE ?? 'https://frc4451.github.io',
  author: 'Abdullah Khaled',
  github: 'https://github.com/itkan-robotics/mantik',
  brand: {
    iconLight: '/media/mantik-icon.svg',
    iconDark: '/media/mantik-icon-dark.svg',
    lockupLight: '/media/logos/mantik-lockup-horizontal.svg',
    lockupDark: '/media/logos/mantik-lockup-horizontal-dark.svg',
    ogImage: '/media/mantik-icon.svg',
  },
};

export function sectionFromPath(pathname: string): SectionId | null {
  const match = pathname.match(/^\/(tools|java|assignments|kit-bot|frc)/);
  return match ? (match[1] as SectionId) : null;
}

export function lessonUrl(section: SectionId, lessonId: string): string {
  if (lessonId === 'overview') return `/${section}`;
  return `/${section}/${lessonId}`;
}
