import { makeAutoObservable, runInAction } from 'mobx';
import type { Group, CreateGroupInput, UpdateGroupInput } from '@/domain';
import { groupRepository } from '@/repositories';
import type { RootStore } from './RootStore';

export class GroupStore {
  groups: Group[] = [];
  loading = false;
  saving = false;

  searchQuery = '';
  currentPage = 1;
  pageSize = 10;

  private rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable<GroupStore, 'rootStore'>(
      this,
      { rootStore: false },
      { autoBind: true },
    );
  }

  // -- Filtering --

  get filteredGroups(): Group[] {
    let result: Group[] = this.groups;

    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(query) ||
          g.description.toLowerCase().includes(query) ||
          g.tags.some((t) => t.includes(query)),
      );
    }

    return result;
  }

  get totalFilteredGroups(): number {
    return this.filteredGroups.length;
  }

  // -- Pagination --

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalFilteredGroups / this.pageSize));
  }

  /** Clamped to [1, totalPages] so it stays valid after data changes. */
  get safeCurrentPage(): number {
    return Math.min(Math.max(1, this.currentPage), this.totalPages);
  }

  get paginatedGroups(): Group[] {
    const start = (this.safeCurrentPage - 1) * this.pageSize;
    return this.filteredGroups.slice(start, start + this.pageSize);
  }

  // -- Derived data --

  /** All unique tags across every group, sorted alphabetically. */
  get allTags(): string[] {
    const tagSet = new Set<string>();
    for (const g of this.groups) {
      for (const t of g.tags) {
        tagSet.add(t);
      }
    }
    return Array.from(tagSet).sort();
  }

  /** Map of groupId → member count. Derived from userStore.users. */
  get memberCountByGroupId(): Map<string, number> {
    const counts = new Map<string, number>();

    for (const g of this.groups) {
      counts.set(g.id, 0);
    }
    for (const user of this.rootStore.userStore.users) {
      for (const gid of user.groupIds) {
        counts.set(gid, (counts.get(gid) ?? 0) + 1);
      }
    }

    return counts;
  }

  // -- Filter / pagination actions --

  setSearchQuery(query: string): void {
    this.searchQuery = query;
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

  async loadGroups(): Promise<void> {
    this.loading = true;
    try {
      const data = await groupRepository.getAll();
      runInAction(() => {
        this.groups = data;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async createGroup(input: CreateGroupInput): Promise<void> {
    this.saving = true;
    try {
      const created = await groupRepository.create(input);
      runInAction(() => {
        this.groups.push(created);
      });
    } finally {
      runInAction(() => {
        this.saving = false;
      });
    }
  }

  async updateGroup(id: string, input: UpdateGroupInput): Promise<void> {
    this.saving = true;
    try {
      const updated = await groupRepository.update(id, input);
      runInAction(() => {
        const idx = this.groups.findIndex((g) => g.id === id);
        if (idx !== -1) {
          this.groups[idx] = updated;
        }
      });
    } finally {
      runInAction(() => {
        this.saving = false;
      });
    }
  }

  /** ⚠ Only removes the group — does NOT clean user.groupIds. Use RootStore.deleteGroup() from UI. */
  async deleteGroup(id: string): Promise<void> {
    this.saving = true;
    try {
      await groupRepository.delete(id);
      runInAction(() => {
        this.groups = this.groups.filter((g) => g.id !== id);
      });
    } finally {
      runInAction(() => {
        this.saving = false;
      });
    }
  }
}
