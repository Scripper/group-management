import { makeAutoObservable, runInAction } from 'mobx';
import type { User, CreateUserInput, UpdateUserInput } from '@/domain';
import { fullName } from '@/domain';
import { normalizeEmail } from '@/shared/lib';
import { userRepository } from '@/repositories';
import { setUsers } from '@/data';
import type { RootStore } from './RootStore';

export class UserStore {
  users: User[] = [];
  loading = false;
  saving = false;

  searchQuery = '';
  selectedGroupId: string | null = null;
  selectedGroupTag: string | null = null;
  currentPage = 1;
  pageSize = 10;

  private rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable<UserStore, 'rootStore'>(
      this,
      { rootStore: false },
      { autoBind: true },
    );
  }

  // -- Filtering --

  get filteredUsers(): User[] {
    let result: User[] = this.users;

    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      result = result.filter((u) => {
        const full = fullName(u).toLowerCase();
        return (
          u.firstName.toLowerCase().includes(query) ||
          u.lastName.toLowerCase().includes(query) ||
          full.includes(query) ||
          u.email.toLowerCase().includes(query)
        );
      });
    }

    if (this.selectedGroupId) {
      const gid = this.selectedGroupId;
      result = result.filter((u) => u.groupIds.includes(gid));
    }

    // Filter by group tag: keep users in at least one group carrying the tag
    if (this.selectedGroupTag) {
      const tag = this.selectedGroupTag;
      const groupIdsWithTag = new Set(
        this.rootStore.groupStore.groups
          .filter((g) => g.tags.includes(tag))
          .map((g) => g.id),
      );
      result = result.filter((u) =>
        u.groupIds.some((id) => groupIdsWithTag.has(id)),
      );
    }

    return result;
  }

  get totalFilteredUsers(): number {
    return this.filteredUsers.length;
  }

  // -- Pagination --

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalFilteredUsers / this.pageSize));
  }

  /** Clamped to [1, totalPages] so it stays valid after data changes. */
  get safeCurrentPage(): number {
    return Math.min(Math.max(1, this.currentPage), this.totalPages);
  }

  get paginatedUsers(): User[] {
    const start = (this.safeCurrentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get availableGroups() {
    return this.rootStore.groupStore.groups;
  }

  get availableGroupTags(): string[] {
    return this.rootStore.groupStore.allTags;
  }

  // -- Filter / pagination actions --

  setSearchQuery(query: string): void {
    this.searchQuery = query;
    this.currentPage = 1;
  }

  setSelectedGroupId(id: string | null): void {
    this.selectedGroupId = id;
    this.currentPage = 1;
  }

  setSelectedGroupTag(tag: string | null): void {
    this.selectedGroupTag = tag;
    this.currentPage = 1;
  }

  setCurrentPage(page: number): void {
    this.currentPage = page;
  }

  setPageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  // -- CRUD --

  async loadUsers(): Promise<void> {
    this.loading = true;
    try {
      const data = await userRepository.getAll();
      runInAction(() => {
        this.users = data;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async createUser(input: CreateUserInput): Promise<void> {
    this.saving = true;
    try {
      const created = await userRepository.create(input);
      runInAction(() => {
        this.users.push(created);
      });
    } finally {
      runInAction(() => {
        this.saving = false;
      });
    }
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<void> {
    this.saving = true;
    try {
      const updated = await userRepository.update(id, input);
      runInAction(() => {
        const idx = this.users.findIndex((u) => u.id === id);
        if (idx !== -1) {
          this.users[idx] = updated;
        }
      });
    } finally {
      runInAction(() => {
        this.saving = false;
      });
    }
  }

  async deleteUser(id: string): Promise<void> {
    this.saving = true;
    try {
      await userRepository.delete(id);
      runInAction(() => {
        this.users = this.users.filter((u) => u.id !== id);
      });
    } finally {
      runInAction(() => {
        this.saving = false;
      });
    }
  }

  async assignGroupsToUser(userId: string, groupIds: string[]): Promise<void> {
    await this.updateUser(userId, { groupIds });
  }

  // -- Validation --

  /** Case-insensitive email uniqueness check. Pass excludeUserId when editing. */
  isEmailUnique(email: string, excludeUserId?: string): boolean {
    const normalized = normalizeEmail(email);
    return !this.users.some(
      (u) => u.email === normalized && u.id !== excludeUserId,
    );
  }

  // -- Cross-entity (called only by RootStore.deleteGroup) --

  /** Remove a groupId from every user. Also persists to in-memory storage. */
  removeGroupFromAllUsers(groupId: string): void {
    let changed = false;
    const now = new Date().toISOString();

    this.users = this.users.map((u) => {
      if (!u.groupIds.includes(groupId)) return u;
      changed = true;
      return {
        ...u,
        groupIds: u.groupIds.filter((id) => id !== groupId),
        updatedAt: now,
      };
    });

    if (changed) {
      setUsers(this.users);
    }
  }
}

