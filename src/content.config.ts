import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const lessonSchema = z.object({
  title: z.string(),
  lessonId: z.string(),
  section: z.enum(['tools', 'java', 'assignments', 'kit-bot', 'frc']),
  group: z.string().optional(),
  groupLabel: z.string().optional(),
  groupOrder: z.number().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  duration: z.string().optional(),
  // Hands-on pages (installs, repo tours, tuning sessions) carry a wall-clock
  // estimate that scripts/estimate-durations.mjs must not overwrite.
  durationFixed: z.boolean().optional().default(false),
  order: z.number().default(0),
  description: z.string().optional(),
  draft: z.boolean().optional().default(false),
  isOverview: z.boolean().optional().default(false),
  // Builds a page reachable by direct URL, but hidden from the sidebar,
  // prev/next navigation, and site search. Unlike `draft`, the page still exists.
  unlisted: z.boolean().optional().default(false),
});
 
const createLessonCollection = (
  section: 'tools' | 'java' | 'assignments' | 'kit-bot' | 'frc',
) =>
  defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: `./src/content/${section}` }),
    schema: lessonSchema.extend({ section: z.literal(section) }),
  });

export const collections = {
  tools: createLessonCollection('tools'),
  java: createLessonCollection('java'),
  assignments: createLessonCollection('assignments'),
  'kit-bot': createLessonCollection('kit-bot'),
  frc: createLessonCollection('frc'),
  homepage: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/homepage' }),
    schema: z.object({
      title: z.string(),
      description: z.string().optional(),
    }),
  }),
  references: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/references' }),
    schema: z.object({
      title: z.string(),
      description: z.string().optional(),
    }),
  }),
};
