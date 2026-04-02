import { describe, it, expect, beforeEach, vi } from 'vitest';
import { runInAction } from 'mobx';
import { RootStore } from '../RootStore';
import { resetStorage } from '@/data';

vi.mock('@/shared/lib/delay', () => ({
  delay: () => Promise.resolve(),
}));

describe('GroupStore', () => {
  let root: RootStore;

  beforeEach(() => {
    resetStorage();
    root = new RootStore();
  });

  /* ── Initial state ─────────────────────────────────── */

  it('starts with empty groups and default pagination', () => {
    const { groupStore } = root;
    expect(groupStore.groups).toEqual([]);
    expect(groupStore.loading).toBe(false);
    expect(groupStore.saving).toBe(false);
    expect(groupStore.searchQuery).toBe('');
    expect(groupStore.currentPage).toBe(1);
    expect(groupStore.pageSize).toBe(10);
  });

  /* ── loadGroups ────────────────────────────────────── */

  it('loadGroups populates groups from storage', async () => {
    const { groupStore } = root;
    await groupStore.loadGroups();
    expect(groupStore.groups.length).toBe(8); // seed data has 8 groups
    expect(groupStore.loading).toBe(false);
  });

  /* ── CRUD ──────────────────────────────────────────── */

  it('createGroup adds a new group', async () => {
    const { groupStore } = root;
    await groupStore.loadGroups();
    const before = groupStore.groups.length;

    await groupStore.createGroup({
      name: 'New Team',
      description: 'A brand new team',
      tags: ['new', 'test'],
    });

    expect(groupStore.groups.length).toBe(before + 1);
    const created = groupStore.groups.find((g) => g.name === 'New Team');
    expect(created).toBeDefined();
    expect(created!.tags).toEqual(['new', 'test']);
    expect(groupStore.saving).toBe(false);
  });

  it('updateGroup modifies an existing group', async () => {
    const { groupStore } = root;
    await groupStore.loadGroups();

    const group = groupStore.groups[0];
    await groupStore.updateGroup(group.id, { name: 'Renamed' });

    const updated = groupStore.groups.find((g) => g.id === group.id);
    expect(updated!.name).toBe('Renamed');
    expect(groupStore.saving).toBe(false);
  });

  it('deleteGroup removes a group', async () => {
    const { groupStore } = root;
    await groupStore.loadGroups();

    const group = groupStore.groups[0];
    const before = groupStore.groups.length;
    await groupStore.deleteGroup(group.id);

    expect(groupStore.groups.length).toBe(before - 1);
    expect(groupStore.groups.find((g) => g.id === group.id)).toBeUndefined();
    expect(groupStore.saving).toBe(false);
  });

  /* ── Filtering: search ─────────────────────────────── */

  it('filteredGroups filters by name', async () => {
    const { groupStore } = root;
    await groupStore.loadGroups();

    runInAction(() => { groupStore.searchQuery = 'engineering'; });
    expect(groupStore.filteredGroups.length).toBe(1);
    expect(groupStore.filteredGroups[0].name).toBe('Engineering');
  });

  it('filteredGroups filters by description', async () => {
    const { groupStore } = root;
    await groupStore.loadGroups();

    runInAction(() => { groupStore.searchQuery = 'machine learning'; });
    expect(groupStore.filteredGroups.length).toBe(1);
    expect(groupStore.filteredGroups[0].name).toBe('Data Science');
  });

  it('filteredGroups filters by tag', async () => {
    const { groupStore } = root;
    await groupStore.loadGroups();

    runInAction(() => { groupStore.searchQuery = 'devops'; });
    expect(groupStore.filteredGroups.some((g) => g.name === 'DevOps')).toBe(true);
  });

  it('filteredGroups is case-insensitive', async () => {
    const { groupStore } = root;
    await groupStore.loadGroups();

    runInAction(() => { groupStore.searchQuery = 'DESIGN'; });
    expect(groupStore.filteredGroups.length).toBe(1);
    expect(groupStore.filteredGroups[0].name).toBe('Design');
  });

  it('filteredGroups returns all when query is empty', async () => {
    const { groupStore } = root;
    await groupStore.loadGroups();
    expect(groupStore.filteredGroups.length).toBe(8);
  });

  /* ── Pagination ────────────────────────────────────── */

  it('paginatedGroups returns the correct page slice', async () => {
    const { groupStore } = root;
    await groupStore.loadGroups();

    // 8 groups, page size 10 → all on page 1
    expect(groupStore.paginatedGroups.length).toBe(8);
    expect(groupStore.totalPages).toBe(1);
  });

  it('paginatedGroups paginates with smaller page size', async () => {
    const { groupStore } = root;
    await groupStore.loadGroups();

    groupStore.setPageSize(3);
    expect(groupStore.paginatedGroups.length).toBe(3);
    expect(groupStore.totalPages).toBe(3); // ceil(8/3)

    groupStore.setCurrentPage(3);
    expect(groupStore.paginatedGroups.length).toBe(2); // 8 - 6 = 2
  });

  it('setSearchQuery resets to page 1', async () => {
    const { groupStore } = root;
    await groupStore.loadGroups();

    groupStore.setCurrentPage(2);
    groupStore.setSearchQuery('eng');
    expect(groupStore.currentPage).toBe(1);
  });

  it('safeCurrentPage clamps to valid range', async () => {
    const { groupStore } = root;
    await groupStore.loadGroups();

    groupStore.setCurrentPage(999);
    expect(groupStore.safeCurrentPage).toBe(groupStore.totalPages);
  });

  /* ── Computed: allTags ─────────────────────────────── */

  it('allTags returns unique sorted tags', async () => {
    const { groupStore } = root;
    await groupStore.loadGroups();

    const tags = groupStore.allTags;
    expect(tags.length).toBeGreaterThan(0);
    // Verify sorted
    const sorted = [...tags].sort();
    expect(tags).toEqual(sorted);
    // Verify unique
    expect(new Set(tags).size).toBe(tags.length);
  });

  it('allTags updates when a group is added', async () => {
    const { groupStore } = root;
    await groupStore.loadGroups();

    const before = groupStore.allTags.length;
    await groupStore.createGroup({
      name: 'New',
      description: 'New group',
      tags: ['brand-new-unique-tag'],
    });

    expect(groupStore.allTags.length).toBe(before + 1);
    expect(groupStore.allTags).toContain('brand-new-unique-tag');
  });

  /* ── Computed: memberCountByGroupId ────────────────── */

  it('memberCountByGroupId counts users per group', async () => {
    const { groupStore, userStore } = root;
    await groupStore.loadGroups();
    await userStore.loadUsers();

    const counts = groupStore.memberCountByGroupId;

    // Every known group has an entry
    for (const g of groupStore.groups) {
      expect(counts.has(g.id)).toBe(true);
    }

    // Verify g1 (Engineering) count manually
    const g1Expected = userStore.users.filter((u) => u.groupIds.includes('g1')).length;
    expect(counts.get('g1')).toBe(g1Expected);
    expect(g1Expected).toBeGreaterThan(0);
  });

  it('memberCountByGroupId updates after adding a user to a group', async () => {
    const { groupStore, userStore } = root;
    await groupStore.loadGroups();
    await userStore.loadUsers();

    const countBefore = groupStore.memberCountByGroupId.get('g1')!;

    await userStore.createUser({
      firstName: 'New',
      lastName: 'Member',
      email: 'new.member@example.com',
      groupIds: ['g1'],
    });

    expect(groupStore.memberCountByGroupId.get('g1')).toBe(countBefore + 1);
  });
});

