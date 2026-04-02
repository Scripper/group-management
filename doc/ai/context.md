# Implementation Notes for AI Iterations

> This file provides architectural context and invariants for future AI-assisted changes.
> Read it **before** making changes. It describes invariants that are easy to break
> silently and extension points that are safe to use.

---

## Folder Responsibilities

| Folder              | Responsibility                                                                                  | May depend on                |
| ------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------- |
| `src/domain/`       | Pure TypeScript interfaces (`User`, `Group`) and DTOs. Zero runtime dependencies.                | nothing                      |
| `src/shared/lib/`   | Stateless utility functions: normalisation, ID generation, delay simulation.                     | nothing                      |
| `src/data/`         | Seed data arrays and the in-memory storage module (`getUsers`/`setUsers`/`getGroups`/`setGroups`). | `domain`                     |
| `src/repositories/` | Async CRUD functions over `data/storage`. Simulates latency with `delay()`.                      | `domain`, `data`, `shared`   |
| `src/store/`        | MobX stores: `RootStore`, `UserStore`, `GroupStore`, React context + `useStore` hook.            | `domain`, `repositories`, `shared` |
| `src/features/`     | Page-level UI components (one subfolder per feature). Uses `observer` to bind to stores.          | `domain`, `store`, `shared`  |
| `src/app/`          | App shell: `App.tsx`, `AppLayout.tsx`, `routes.tsx`. Bootstrapping and navigation.                | `store`, `features`          |

### Dependency rule

**Layers only import from layers above them in the table.** Features never import from `data/` or `repositories/` directly — they go through stores.

---

## Store Responsibilities

### RootStore (`store/RootStore.ts`)

- Creates and owns `UserStore` and `GroupStore`.
- Provides cross-entity orchestration methods.
- Currently the only cross-entity method is `deleteGroup(groupId)`.
- **Rule:** any operation that touches both Users and Groups must live here, not in a sub-store or a component.

### UserStore (`store/UserStore.ts`)

- Owns: `users[]`, `loading`, `saving`, search/filter/pagination state.
- Computed: `filteredUsers`, `paginatedUsers`, `totalFilteredUsers`, `totalPages`, `safeCurrentPage`, `availableGroups`, `availableGroupTags`.
- CRUD actions delegate to `userRepository`.
- Exposes `isEmailUnique(email, excludeUserId?)` for form validation.
- Exposes `removeGroupFromAllUsers(groupId)` — **only callable by RootStore**.

### GroupStore (`store/GroupStore.ts`)

- Owns: `groups[]`, `loading`, `saving`, search/pagination state.
- Computed: `filteredGroups`, `paginatedGroups`, `totalFilteredGroups`, `totalPages`, `safeCurrentPage`, `allTags`, `memberCountByGroupId`.
- `memberCountByGroupId` reads `rootStore.userStore.users` — this is the **only** cross-store computed.
- `allTags` aggregates unique tags across all groups, sorted alphabetically.
- `deleteGroup()` removes only the group. It does **not** clean user memberships. Use `RootStore.deleteGroup()` from UI code.

---

## Important Invariants

These invariants **must not be violated** during any refactor or feature addition:

### 1. Membership lives only in `user.groupIds`

- The `Group` type has no `memberIds` or `members` field.
- Group member count is always derived: `GroupStore.memberCountByGroupId` iterates `userStore.users`.
- **Never** add a `memberIds` field to `Group`. If you need member data, derive it from `UserStore.users`.

### 2. Business logic stays out of components

- Components call store actions and read store computeds. They do not filter, sort, or aggregate domain data.
- Components may own transient UI-only state such as modal visibility or form instance state.
- Filters, pagination, search queries, loading flags — all of these live in stores.

### 3. Filters and pagination live in stores

- `searchQuery`, `selectedGroupId`, `selectedGroupTag`, `currentPage`, `pageSize` are MobX observables.
- `filteredUsers`, `paginatedUsers`, etc. are MobX computeds derived from those observables.
- **Do not** move filtering logic into `useMemo` or component state.

### 4. Derived member count — never stored

- `memberCountByGroupId` is a MobX `get` computed on `GroupStore`.
- It recomputes automatically when `userStore.users` changes.
- **Do not** cache or persist this count separately.

### 5. Repository layer is in-memory and replaceable

- Repositories are simple objects with `getAll`, `create`, `update`, `delete` methods.
- They normalize fields on write and simulate async with `delay()`.
- They do **not** perform cross-entity coordination, validation beyond format, or filtering.
- To replace with a real API: swap the function bodies, keep the same signatures. Stores won't change.

### 6. Cross-entity deletion goes through RootStore

- UI code calls `rootStore.deleteGroup(groupId)`.
- This method: (a) strips the group from all users, (b) deletes the group, (c) clears stale user filters.
- **Never** call `groupStore.deleteGroup()` directly from UI code for user-facing deletions.

### 7. Normalisation happens at write boundaries

- Repositories normalise on `create` and `update` (email lowercase, names trimmed, tags normalised).
- Form components normalise tags before passing to store actions.
- Store-level `isEmailUnique` normalises the input email before comparison.
- **Do not** rely on data being normalised at read time — enforce it at write time.

### 8. Storage returns copies

- `getUsers()` and `getGroups()` return shallow copies (`[...array]`).
- `setUsers()` and `setGroups()` store shallow copies internally.
- This prevents accidental direct mutation of the backing store from repositories or store code.

---

## Rules for Future Changes

1. **Adding a new entity** (e.g. Role):
   - Add types to `domain/`.
   - Add seed data and storage functions to `data/`.
   - Add a repository to `repositories/`.
   - Add a store to `store/` and register it in `RootStore`.
   - Add feature components to `features/`.
   - If the new entity has cross-entity relationships, coordinate in `RootStore`.

2. **Adding a new filter** (e.g. filter users by creation date):
   - Add observable state to `UserStore` (e.g. `dateRange`).
   - Add a setter action that resets `currentPage` to 1.
   - Extend the `filteredUsers` computed to apply the new filter.
   - Add UI control in `UsersFilters.tsx`.

3. **Adding a new computed/derived column**:
   - Add a `get` computed to the appropriate store.
   - Never compute derived data inside a component body or `useMemo`.

4. **Replacing in-memory storage with a real API**:
   - Swap repository function bodies to use `fetch` / `axios`.
   - Remove `delay()` calls.
   - Keep the same `Promise<Entity>` / `Promise<void>` signatures.
   - Stores remain unchanged.
   - Remove `data/storage.ts` and seed modules (or keep for test fixtures).

5. **Adding tests**:
   - Stores can be tested in isolation: instantiate `RootStore`, call actions, assert on computeds.
   - Repositories can be tested by calling them and reading storage state.
   - Components can be tested with React Testing Library + MobX provider.

---

## What Must Not Be Broken During Refactors

| Invariant                                     | How to verify                                                                 |
| --------------------------------------------- | ----------------------------------------------------------------------------- |
| No `memberIds` on Group                       | Grep for `memberIds` — should return zero results                             |
| Member count is derived                       | `memberCountByGroupId` is a `get` computed, not an observable                 |
| `removeGroupFromAllUsers` syncs storage        | After calling it, `getUsers()` from storage must reflect the change           |
| Email uniqueness is case-insensitive          | `isEmailUnique` normalises both sides before comparison                       |
| Tags are lowercase and deduplicated           | `normalizeTags` is called on every group create/update path                   |
| Page resets to 1 on filter change             | Every `setSearch*` / `setSelected*` / `setPageSize` action sets `currentPage = 1` |
| `safeCurrentPage` clamps to valid range       | `Math.min(Math.max(1, currentPage), totalPages)` — never out of bounds        |
| Stale filter cleanup on group deletion        | `RootStore.deleteGroup` clears `selectedGroupId` / `selectedGroupTag` if orphaned |
| Components use `observer`                     | Every component that reads store state is wrapped with `observer()`            |
| `rootStore` is excluded from auto-observable  | `makeAutoObservable(this, { rootStore: false })` — prevents circular tracking  |

---

## Safe Extension Points

These are areas designed to be extended without risk of breaking existing functionality:

- **New columns in tables** — add column definitions in `UsersTable.tsx` / `GroupsTable.tsx`.
- **New form fields** — add `Form.Item` entries in `UserFormModal.tsx` / `GroupFormModal.tsx` (also update domain types and repository normalisation).
- **New filter controls** — add observable + setter + computed filter logic in the store, add UI in `UsersFilters.tsx`.
- **New pages / features** — add route in `routes.tsx`, create a feature folder in `features/`.
- **New seed data** — add entries to `seedUsers.ts` / `seedGroups.ts` (keep cross-references consistent).
- **Storage backend swap** — replace repository internals, keep signatures.

---

## File Quick Reference

```
src/domain/user.ts          User, CreateUserInput, UpdateUserInput, fullName()
src/domain/group.ts         Group, CreateGroupInput, UpdateGroupInput
src/shared/lib/normalize.ts trimString, normalizeEmail, normalizeTag, normalizeTags
src/shared/lib/generateId.ts  generateId() — crypto.randomUUID with fallback
src/shared/lib/delay.ts     delay() — 250-400ms async pause
src/shared/hooks/useUrlSync.ts  useUrlSync() — bidirectional MobX ↔ URL search params sync
src/data/storage.ts         getUsers, setUsers, getGroups, setGroups, resetStorage
src/data/seedUsers.ts       SEED_USERS (22 users)
src/data/seedGroups.ts      SEED_GROUPS (8 groups)
src/repositories/userRepository.ts   { getAll, create, update, delete }
src/repositories/groupRepository.ts  { getAll, create, update, delete }
src/store/RootStore.ts      RootStore class — owns sub-stores, deleteGroup()
src/store/UserStore.ts      UserStore class — users state, CRUD, filters, pagination
src/store/GroupStore.ts      GroupStore class — groups state, CRUD, search, pagination
src/store/StoreContext.tsx   StoreProvider, useStore()
```

---

## URL-Synced Filters

Filter, search, and pagination state is synced to URL search params using the
`useUrlSync` hook (`src/shared/hooks/useUrlSync.ts`).

### Architecture

- **MobX stores remain the source of truth.** The URL is a secondary reflection.
- On page mount the hook reads URL params and hydrates the store in a single
  `runInAction` batch (so page numbers aren't reset by filter setters).
- A MobX `autorun` watches all bound store values and writes them to the URL
  via `setSearchParams(…, { replace: true })`.
- Default values (page 1, size 10) are omitted from the URL to keep it clean.

### URL Parameters

| Page   | Param   | Store field                       | Default (omitted) |
|--------|---------|-----------------------------------|--------------------|
| Users  | `q`     | `userStore.searchQuery`           | empty              |
| Users  | `group` | `userStore.selectedGroupId`       | null               |
| Users  | `tag`   | `userStore.selectedGroupTag`      | null               |
| Users  | `page`  | `userStore.currentPage`           | `1`                |
| Users  | `size`  | `userStore.pageSize`              | `10`               |
| Groups | `q`     | `groupStore.searchQuery`          | empty              |
| Groups | `page`  | `groupStore.currentPage`          | `1`                |
| Groups | `size`  | `groupStore.pageSize`             | `10`               |

### Rules

- When adding a **new filter** to a page, add a corresponding `UrlSyncBinding`
  entry in the page component's `urlBindings` array.
- The `fromUrl` callback must set properties **directly** (not via setters that
  reset page), because hydration sets all values atomically in `runInAction`.
- The `toUrl` callback must be a MobX-trackable read (access an observable) so
  the autorun detects changes.

---

## Unit Tests

Tests use **Vitest** and live alongside the source code in `__tests__/` folders.

### Running

```bash
npm test          # single run
npm run test:watch # watch mode
```

### Test Structure

```
src/shared/lib/__tests__/normalize.test.ts   — trimString, normalizeEmail, normalizeTag, normalizeTags
src/shared/lib/__tests__/generateId.test.ts  — generateId uniqueness
src/shared/lib/__tests__/delay.test.ts       — delay timing
src/domain/__tests__/user.test.ts            — fullName
src/store/__tests__/UserStore.test.ts        — UserStore CRUD, filters, pagination, email uniqueness
src/store/__tests__/GroupStore.test.ts       — GroupStore CRUD, search, pagination, allTags, memberCount
src/store/__tests__/RootStore.test.ts        — Cross-entity deleteGroup coordination
```

### Conventions

- Store tests mock `@/shared/lib/delay` to resolve instantly (no async wait).
- Store tests call `resetStorage()` before each test to restore seed data.
- Tests import `describe`, `it`, `expect` from `vitest` explicitly (no globals).

