import { describe, it, expect, beforeEach, vi } from 'vitest';
import { runInAction } from 'mobx';
import { RootStore } from '../RootStore';
import { resetStorage } from '@/data';

// Eliminate async delay in repository calls so tests run instantly.
vi.mock('@/shared/lib/delay', () => ({
  delay: () => Promise.resolve(),
}));

describe('UserStore', () => {
  let root: RootStore;

  beforeEach(() => {
    resetStorage();
    root = new RootStore();
  });

  /* ── Initial state ─────────────────────────────────── */

  it('starts with empty users and default pagination', () => {
    const { userStore } = root;
    expect(userStore.users).toEqual([]);
    expect(userStore.loading).toBe(false);
    expect(userStore.saving).toBe(false);
    expect(userStore.searchQuery).toBe('');
    expect(userStore.selectedGroupId).toBeNull();
    expect(userStore.selectedGroupTag).toBeNull();
    expect(userStore.currentPage).toBe(1);
    expect(userStore.pageSize).toBe(10);
  });

  /* ── loadUsers ─────────────────────────────────────── */

  it('loadUsers populates users from storage', async () => {
    const { userStore } = root;
    await userStore.loadUsers();
    expect(userStore.users.length).toBe(22); // seed data has 22 users
    expect(userStore.loading).toBe(false);
  });

  /* ── CRUD ──────────────────────────────────────────── */

  it('createUser adds a new user', async () => {
    const { userStore } = root;
    await userStore.loadUsers();
    const before = userStore.users.length;

    await userStore.createUser({
      firstName: 'Test',
      lastName: 'User',
      email: 'test.user@example.com',
      groupIds: [],
    });

    expect(userStore.users.length).toBe(before + 1);
    const created = userStore.users.find((u) => u.email === 'test.user@example.com');
    expect(created).toBeDefined();
    expect(created!.firstName).toBe('Test');
    expect(userStore.saving).toBe(false);
  });

  it('updateUser modifies an existing user', async () => {
    const { userStore } = root;
    await userStore.loadUsers();

    const user = userStore.users[0];
    await userStore.updateUser(user.id, { firstName: 'Updated' });

    const updated = userStore.users.find((u) => u.id === user.id);
    expect(updated!.firstName).toBe('Updated');
    expect(userStore.saving).toBe(false);
  });

  it('deleteUser removes a user', async () => {
    const { userStore } = root;
    await userStore.loadUsers();

    const user = userStore.users[0];
    const before = userStore.users.length;
    await userStore.deleteUser(user.id);

    expect(userStore.users.length).toBe(before - 1);
    expect(userStore.users.find((u) => u.id === user.id)).toBeUndefined();
    expect(userStore.saving).toBe(false);
  });

  /* ── Filtering: search ─────────────────────────────── */

  it('filteredUsers filters by first name', async () => {
    const { userStore } = root;
    await userStore.loadUsers();

    runInAction(() => { userStore.searchQuery = 'alice'; });
    expect(userStore.filteredUsers.length).toBe(1);
    expect(userStore.filteredUsers[0].firstName).toBe('Alice');
  });

  it('filteredUsers filters by email', async () => {
    const { userStore } = root;
    await userStore.loadUsers();

    runInAction(() => { userStore.searchQuery = 'bob.smith@'; });
    expect(userStore.filteredUsers.length).toBe(1);
    expect(userStore.filteredUsers[0].email).toBe('bob.smith@example.com');
  });

  it('filteredUsers filters by full name', async () => {
    const { userStore } = root;
    await userStore.loadUsers();

    runInAction(() => { userStore.searchQuery = 'alice johnson'; });
    expect(userStore.filteredUsers.length).toBe(1);
  });

  it('filteredUsers is case-insensitive', async () => {
    const { userStore } = root;
    await userStore.loadUsers();

    runInAction(() => { userStore.searchQuery = 'ALICE'; });
    expect(userStore.filteredUsers.length).toBe(1);
  });

  /* ── Filtering: by group ───────────────────────────── */

  it('filteredUsers filters by selectedGroupId', async () => {
    const { userStore } = root;
    await userStore.loadUsers();
    await root.groupStore.loadGroups();

    runInAction(() => { userStore.selectedGroupId = 'g1'; });
    // All users with groupIds containing 'g1'
    expect(userStore.filteredUsers.every((u) => u.groupIds.includes('g1'))).toBe(true);
    expect(userStore.filteredUsers.length).toBeGreaterThan(0);
  });

  /* ── Filtering: by group tag ───────────────────────── */

  it('filteredUsers filters by selectedGroupTag', async () => {
    const { userStore } = root;
    await userStore.loadUsers();
    await root.groupStore.loadGroups();

    // "tech" tag is on g1 (Engineering) and g6 (DevOps)
    runInAction(() => { userStore.selectedGroupTag = 'tech'; });
    const techGroupIds = root.groupStore.groups
      .filter((g) => g.tags.includes('tech'))
      .map((g) => g.id);

    for (const u of userStore.filteredUsers) {
      expect(u.groupIds.some((gid) => techGroupIds.includes(gid))).toBe(true);
    }
    expect(userStore.filteredUsers.length).toBeGreaterThan(0);
  });

  /* ── Pagination ────────────────────────────────────── */

  it('paginatedUsers returns correct page slice', async () => {
    const { userStore } = root;
    await userStore.loadUsers();

    expect(userStore.paginatedUsers.length).toBe(10); // first page, size 10
    expect(userStore.totalFilteredUsers).toBe(22);
    expect(userStore.totalPages).toBe(3); // ceil(22/10)
  });

  it('setCurrentPage changes the page', async () => {
    const { userStore } = root;
    await userStore.loadUsers();

    userStore.setCurrentPage(2);
    expect(userStore.safeCurrentPage).toBe(2);
    expect(userStore.paginatedUsers.length).toBe(10);

    userStore.setCurrentPage(3);
    expect(userStore.paginatedUsers.length).toBe(2); // 22 - 20 = 2
  });

  it('setPageSize resets to page 1', async () => {
    const { userStore } = root;
    await userStore.loadUsers();

    userStore.setCurrentPage(2);
    userStore.setPageSize(25);
    expect(userStore.currentPage).toBe(1);
    expect(userStore.pageSize).toBe(25);
    expect(userStore.paginatedUsers.length).toBe(22); // all fit on one page
  });

  it('setSearchQuery resets to page 1', async () => {
    const { userStore } = root;
    await userStore.loadUsers();

    userStore.setCurrentPage(2);
    userStore.setSearchQuery('alice');
    expect(userStore.currentPage).toBe(1);
  });

  it('safeCurrentPage clamps to valid range', async () => {
    const { userStore } = root;
    await userStore.loadUsers();

    userStore.setCurrentPage(999);
    expect(userStore.safeCurrentPage).toBe(userStore.totalPages);
  });

  /* ── Computed: availableGroups / availableGroupTags ── */

  it('availableGroups delegates to groupStore.groups', async () => {
    await root.groupStore.loadGroups();
    expect(root.userStore.availableGroups).toBe(root.groupStore.groups);
  });

  it('availableGroupTags delegates to groupStore.allTags', async () => {
    await root.groupStore.loadGroups();
    expect(root.userStore.availableGroupTags).toEqual(root.groupStore.allTags);
  });

  /* ── Email uniqueness ──────────────────────────────── */

  it('isEmailUnique returns true for new email', async () => {
    const { userStore } = root;
    await userStore.loadUsers();
    expect(userStore.isEmailUnique('brand.new@example.com')).toBe(true);
  });

  it('isEmailUnique returns false for existing email', async () => {
    const { userStore } = root;
    await userStore.loadUsers();
    expect(userStore.isEmailUnique('alice.johnson@example.com')).toBe(false);
  });

  it('isEmailUnique is case-insensitive', async () => {
    const { userStore } = root;
    await userStore.loadUsers();
    expect(userStore.isEmailUnique('ALICE.JOHNSON@EXAMPLE.COM')).toBe(false);
  });

  it('isEmailUnique excludes specified user id', async () => {
    const { userStore } = root;
    await userStore.loadUsers();
    const alice = userStore.users.find((u) => u.email === 'alice.johnson@example.com')!;
    // When editing Alice, her own email should not be flagged
    expect(userStore.isEmailUnique('alice.johnson@example.com', alice.id)).toBe(true);
  });

  /* ── removeGroupFromAllUsers ───────────────────────── */

  it('removeGroupFromAllUsers strips group from every user', async () => {
    const { userStore } = root;
    await userStore.loadUsers();

    const usersWithG1Before = userStore.users.filter((u) => u.groupIds.includes('g1'));
    expect(usersWithG1Before.length).toBeGreaterThan(0);

    userStore.removeGroupFromAllUsers('g1');

    const usersWithG1After = userStore.users.filter((u) => u.groupIds.includes('g1'));
    expect(usersWithG1After.length).toBe(0);
  });
});


