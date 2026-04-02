# User & Group Management App

SPA for managing users and groups — CRUD, search, filtering, pagination. Built with React 18, TypeScript (strict), MobX 6, Ant Design 5, React Router 6, Vite 6. No backend — all data lives in memory.

## Quick Start

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests (vitest)
npm run build      # production build
```

## Project Structure

```
src/
├── domain/         Pure types: User, Group, DTOs
├── shared/         Helpers (normalize, delay, ID gen) + hooks (URL sync)
├── data/           Seed data + in-memory storage
├── repositories/   Async CRUD over storage (simulated latency)
├── store/          MobX stores — RootStore, UserStore, GroupStore
├── features/
│   ├── users/      UsersPage, UsersFilters, UsersTable, UserFormModal
│   └── groups/     GroupsPage, GroupsSearch, GroupsTable, GroupFormModal
└── app/            Layout, routing, providers
```

Layers only depend downward: `domain → data → repositories → stores → features`.

## State Management (MobX)

```
RootStore
├── UserStore   — users[], filters, pagination, CRUD, email validation
└── GroupStore  — groups[], search, pagination, CRUD, derived tags & member counts
```

**Why MobX?** Computed derivations (filtered lists, member counts, tag aggregations) update automatically. Fine-grained reactivity means only affected components re-render. Each store keeps its state, computeds, and actions together.

Cross-entity operations (e.g. deleting a group also strips it from all users) are coordinated in `RootStore`.

## Key Design Decisions

**Membership lives in `user.groupIds` only.** Groups have no `memberIds` — member counts are MobX computeds derived from users. This prevents the two collections from drifting out of sync.

**Cross-entity deletion** — `RootStore.deleteGroup()` strips the group from all users, deletes the group, and clears any stale filters.

**Normalization at write boundaries** — emails are lowercased/trimmed, tags are lowercased/deduped, names are trimmed. All enforced in repositories on create/update.

**Email uniqueness** is a store-level business rule (`UserStore.isEmailUnique`), not a repository concern.

**URL-synced filters** — search, filter, and pagination state syncs to URL query params via a `useUrlSync` hook, so filtered views are bookmarkable.

## Features

- Users & Groups CRUD with modal forms
- Real-time search (name, email, description, tags)
- Filter users by group or group tag
- Paginated tables with page-size selector
- Free-form tag input with normalization
- Case-insensitive email uniqueness validation
- Derived member counts per group
- Column sorting (name, member count)
- URL-synced filters and pagination
- Loading/saving indicators with simulated latency

## Tradeoffs

- **In-memory only** — data resets on refresh. Storage layer is designed to be swapped for a real API.
- **Client-side pagination** — fine for demo scale, not for large datasets.
- **Simulated latency (250–400ms)** — makes async flows visible but slows rapid interactions.
- **`removeGroupFromAllUsers` is sync** — bypasses repository async for the batch update, writes directly to storage.
- **No group-name uniqueness** — only email uniqueness is enforced.
