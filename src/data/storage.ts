import type { User } from '@/domain';
import type { Group } from '@/domain';
import { SEED_USERS } from './seedUsers';
import { SEED_GROUPS } from './seedGroups';

/** In-memory storage. Getters/setters return/accept copies to prevent direct mutation. */

let users: User[] = structuredClone(SEED_USERS) as User[];
let groups: Group[] = structuredClone(SEED_GROUPS) as Group[];

export function getUsers(): User[] {
  return [...users];
}

export function setUsers(next: User[]): void {
  users = [...next];
}

export function getGroups(): Group[] {
  return [...groups];
}

export function setGroups(next: Group[]): void {
  groups = [...next];
}

export function resetStorage(): void {
  users = structuredClone(SEED_USERS) as User[];
  groups = structuredClone(SEED_GROUPS) as Group[];
}
