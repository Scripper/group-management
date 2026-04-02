import { UserStore } from './UserStore';
import { GroupStore } from './GroupStore';

/** Top-level store container. Cross-entity operations live here. */
export class RootStore {
  readonly userStore: UserStore;
  readonly groupStore: GroupStore;

  constructor() {
    this.userStore = new UserStore(this);
    this.groupStore = new GroupStore(this);
  }

  /** Delete a group: strips it from all users, deletes the group, clears stale filters. */
  async deleteGroup(groupId: string): Promise<void> {
    this.userStore.removeGroupFromAllUsers(groupId);
    await this.groupStore.deleteGroup(groupId);

    if (this.userStore.selectedGroupId === groupId) {
      this.userStore.setSelectedGroupId(null);
    }
    if (
      this.userStore.selectedGroupTag &&
      !this.groupStore.allTags.includes(this.userStore.selectedGroupTag)
    ) {
      this.userStore.setSelectedGroupTag(null);
    }
  }
}
