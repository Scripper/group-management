import type { User, CreateUserInput, UpdateUserInput } from '@/domain';
import { getUsers, setUsers } from '@/data';
import { generateId, normalizeEmail, trimString } from '@/shared/lib';
import { delay } from '@/shared/lib/delay';

/** In-memory user repository. Simulates async CRUD with delay. */
export const userRepository = {
  async getAll(): Promise<User[]> {
    await delay();
    return getUsers();
  },

  async create(input: CreateUserInput): Promise<User> {
    await delay();

    const now = new Date().toISOString();
    const user: User = {
      id: generateId(),
      firstName: trimString(input.firstName),
      lastName: trimString(input.lastName),
      email: normalizeEmail(input.email),
      groupIds: [...input.groupIds],
      createdAt: now,
      updatedAt: now,
    };

    const all = getUsers();
    all.push(user);
    setUsers(all);

    return { ...user };
  },

  async update(id: string, input: UpdateUserInput): Promise<User> {
    await delay();

    const all = getUsers();
    const idx = all.findIndex((u) => u.id === id);
    if (idx === -1) {
      throw new Error(`User not found: ${id}`);
    }

    const existing = all[idx];
    const updated: User = {
      ...existing,
      firstName: input.firstName !== undefined ? trimString(input.firstName) : existing.firstName,
      lastName: input.lastName !== undefined ? trimString(input.lastName) : existing.lastName,
      email: input.email !== undefined ? normalizeEmail(input.email) : existing.email,
      groupIds: input.groupIds !== undefined ? [...input.groupIds] : [...existing.groupIds],
      updatedAt: new Date().toISOString(),
    };

    all[idx] = updated;
    setUsers(all);

    return { ...updated };
  },

  async delete(id: string): Promise<void> {
    await delay();

    const all = getUsers();
    const idx = all.findIndex((u) => u.id === id);
    if (idx === -1) {
      throw new Error(`User not found: ${id}`);
    }

    all.splice(idx, 1);
    setUsers(all);
  },
};

