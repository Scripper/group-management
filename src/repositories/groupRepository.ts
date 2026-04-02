import type { Group, CreateGroupInput, UpdateGroupInput } from '@/domain';
import { getGroups, setGroups } from '@/data';
import { generateId, trimString, normalizeTags } from '@/shared/lib';
import { delay } from '@/shared/lib/delay';

/** In-memory group repository. Simulates async CRUD with delay. */
export const groupRepository = {
  async getAll(): Promise<Group[]> {
    await delay();
    return getGroups();
  },

  async create(input: CreateGroupInput): Promise<Group> {
    await delay();

    const now = new Date().toISOString();
    const group: Group = {
      id: generateId(),
      name: trimString(input.name),
      description: trimString(input.description),
      tags: normalizeTags(input.tags),
      createdAt: now,
      updatedAt: now,
    };

    const all = getGroups();
    all.push(group);
    setGroups(all);

    return { ...group };
  },

  async update(id: string, input: UpdateGroupInput): Promise<Group> {
    await delay();

    const all = getGroups();
    const idx = all.findIndex((g) => g.id === id);
    if (idx === -1) {
      throw new Error(`Group not found: ${id}`);
    }

    const existing = all[idx];
    const updated: Group = {
      ...existing,
      name: input.name !== undefined ? trimString(input.name) : existing.name,
      description: input.description !== undefined ? trimString(input.description) : existing.description,
      tags: input.tags !== undefined ? normalizeTags(input.tags) : [...existing.tags],
      updatedAt: new Date().toISOString(),
    };

    all[idx] = updated;
    setGroups(all);

    return { ...updated };
  },

  /** ⚠ Does NOT clean user.groupIds — cross-entity cleanup is in RootStore. */
  async delete(id: string): Promise<void> {
    await delay();

    const all = getGroups();
    const idx = all.findIndex((g) => g.id === id);
    if (idx === -1) {
      throw new Error(`Group not found: ${id}`);
    }

    all.splice(idx, 1);
    setGroups(all);
  },
};
