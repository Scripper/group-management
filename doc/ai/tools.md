# Available Tools

## Chrome DevTools (MCP)

Use to validate actual behavior in the running app, not just as a code generation companion.

### Expected Usage

- Run the app after implementation changes.
- Verify navigation between Users and Groups pages.
- Validate CRUD flows (create, edit, delete) manually.
- Check search, filters, pagination, and modal behavior.
- Inspect runtime errors in the console.
- Confirm no broken UI after store or routing changes.
- Take snapshots/screenshots to verify visual state.

## Terminal

- Run `npm test` after modifying stores, repositories, or shared utilities.
- Run `npx tsc --noEmit` to verify type-correctness after edits.
- Run `npm run build` before declaring work complete.
