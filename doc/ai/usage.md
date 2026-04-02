# AI Usage

## Tools Used

- **GitHub Copilot (Claude Opus 4.6)** — code drafting and refactoring.
- **ChatGPT (GPT-5.4)** — requirement analysis, architecture planning, MobX store design, review.
- **Chrome DevTools (MCP)** — runtime validation and manual browser checks.

## How AI Was Used

- Break the task into small implementation steps.
- Generate code in controlled scope, one layer at a time.
- Review store design and computed state strategy.
- Validate edge cases: email uniqueness, pagination consistency, group deletion cleanup.

## Rules Given to AI

- Keep membership source of truth in `user.groupIds`.
- Derive member count from users, never store it.
- Keep business logic out of components.
- Keep filters and pagination in stores.
- Avoid out-of-scope refactors.
- Do not implement bonus features before core requirements are stable.