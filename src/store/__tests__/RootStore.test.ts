import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RootStore } from '../RootStore';
import { resetStorage } from '@/data';

vi.mock('@/shared/lib/delay', () => ({
  delay: () => Promise.resolve(),
}));

describe('RootStore', () => {
  let root: RootStore;

  beforeEach(() => {
    resetStorage();
    root = new RootStore();
  });

  it('creates UserStore and GroupStore instances', () => {
    expect(root.userStore).toBeDefined();
    expect(root.groupStore).toBeDefined();
  });

  /* ── deleteGroup: cross-entity coordination ────────── */

  describe('deleteGroup', () => {
    beforeEach(async () => {
      await root.userStore.loadUsers();
      await root.groupStore.loadGroups();
    });

    it('removes the group from groupStore', async () => {
      const before = root.groupStore.groups.length;
      await root.deleteGroup('g1');
      expect(root.groupStore.groups.length).toBe(before - 1);
      expect(root.groupStore.groups.find((g) => g.id === 'g1')).toBeUndefined();
    });

    it('strips the deleted group id from all users', async () => {
      // Verify some users have g1 before deletion
      const withG1Before = root.userStore.users.filter((u) => u.groupIds.includes('g1'));
      expect(withG1Before.length).toBeGreaterThan(0);

      await root.deleteGroup('g1');

      // No user should reference g1 anymore
      const withG1After = root.userStore.users.filter((u) => u.groupIds.includes('g1'));
      expect(withG1After.length).toBe(0);
    });

    it('clears selectedGroupId if it matches the deleted group', async () => {
      root.userStore.setSelectedGroupId('g1');
      expect(root.userStore.selectedGroupId).toBe('g1');

      await root.deleteGroup('g1');

      expect(root.userStore.selectedGroupId).toBeNull();
    });

    it('clears selectedGroupTag if its tag no longer exists', async () => {
      // "engineering" tag is only on g1. Deleting g1 should clear it.
      root.userStore.setSelectedGroupTag('engineering');

      await root.deleteGroup('g1');

      // After deleting g1, "engineering" is no longer in allTags
      expect(root.groupStore.allTags).not.toContain('engineering');
      expect(root.userStore.selectedGroupTag).toBeNull();
    });

    it('preserves selectedGroupTag if the tag still exists on other groups', async () => {
      // "tech" tag is on g1 (Engineering) AND g6 (DevOps)
      root.userStore.setSelectedGroupTag('tech');

      await root.deleteGroup('g1');

      // "tech" should still exist (on g6)
      expect(root.groupStore.allTags).toContain('tech');
      expect(root.userStore.selectedGroupTag).toBe('tech');
    });

    it('member counts update automatically after group deletion', async () => {
      const g2CountBefore = root.groupStore.memberCountByGroupId.get('g2')!;
      expect(g2CountBefore).toBeGreaterThan(0);

      // Deleting g1 shouldn't affect g2 member count
      await root.deleteGroup('g1');

      expect(root.groupStore.memberCountByGroupId.get('g2')).toBe(g2CountBefore);
      expect(root.groupStore.memberCountByGroupId.has('g1')).toBe(false);
    });
  });
});

