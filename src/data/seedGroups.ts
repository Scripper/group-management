import type { Group } from '@/domain';

// 8 seed groups. Tags already normalized.
export const SEED_GROUPS: readonly Group[] = [
  {
    id: 'g1',
    name: 'Engineering',
    description: 'Core product engineering team responsible for building and maintaining the platform.',
    tags: ['engineering', 'development', 'tech'],
    createdAt: '2025-09-01T08:00:00.000Z',
    updatedAt: '2025-11-15T10:30:00.000Z',
  },
  {
    id: 'g2',
    name: 'Design',
    description: 'User experience and visual design team crafting intuitive interfaces.',
    tags: ['design', 'ux', 'creative'],
    createdAt: '2025-09-02T09:00:00.000Z',
    updatedAt: '2025-12-01T14:00:00.000Z',
  },
  {
    id: 'g3',
    name: 'Marketing',
    description: 'Growth and brand marketing team driving user acquisition and engagement.',
    tags: ['marketing', 'growth', 'content'],
    createdAt: '2025-09-03T10:00:00.000Z',
    updatedAt: '2025-11-20T09:15:00.000Z',
  },
  {
    id: 'g4',
    name: 'Product',
    description: 'Product management team defining the roadmap and prioritizing features.',
    tags: ['product', 'strategy', 'roadmap'],
    createdAt: '2025-09-04T11:00:00.000Z',
    updatedAt: '2025-12-10T16:45:00.000Z',
  },
  {
    id: 'g5',
    name: 'Data Science',
    description: 'Analytics and machine learning team turning data into actionable insights.',
    tags: ['data', 'analytics', 'machine-learning'],
    createdAt: '2025-09-10T08:30:00.000Z',
    updatedAt: '2025-12-05T11:00:00.000Z',
  },
  {
    id: 'g6',
    name: 'DevOps',
    description: 'Infrastructure and reliability team ensuring smooth deployments and uptime.',
    tags: ['devops', 'infrastructure', 'tech'],
    createdAt: '2025-09-12T07:45:00.000Z',
    updatedAt: '2025-11-28T13:20:00.000Z',
  },
  {
    id: 'g7',
    name: 'Quality Assurance',
    description: 'QA team responsible for test automation, regression testing, and release quality.',
    tags: ['qa', 'testing', 'automation'],
    createdAt: '2025-09-15T09:00:00.000Z',
    updatedAt: '2025-12-12T10:00:00.000Z',
  },
  {
    id: 'g8',
    name: 'Leadership',
    description: 'Executive and senior management overseeing company-wide strategy and operations.',
    tags: ['management', 'leadership', 'strategy'],
    createdAt: '2025-09-01T07:00:00.000Z',
    updatedAt: '2026-01-05T08:00:00.000Z',
  },
];

