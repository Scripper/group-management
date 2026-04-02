# Architecture

- Use React 18 functional components only.
- Use TypeScript strict-friendly code.
- Keep files cohesive and reasonably small.
- No giant god components.
- Do not implement backend or external API calls.
- Do not refactor unrelated files.
- Do not modify files outside the requested scope.
- Do not add bonus features unless explicitly requested.

# State Management

- Use MobX for all domain state and all list/filter/pagination/loading states.
- Do not use React useState for domain data, filters, pagination, loading, or business state.
- Use MobX computed values for all derived state: filtered lists, paginated lists, member counts, display values, available tags, filter options.
- Use MobX actions for every mutation.
- Wrap reactive components with observer.
- Keep business logic out of React components.
- No giant store with mixed responsibilities.

# Code Quality

- No dead code.
- No placeholder TODO comments unless explicitly requested.
- No hardcoded duplicated literals when a shared constant improves clarity.
- No implicit any.
- No unsafe casts unless absolutely necessary.
- Keep imports clean.
- Prefer clear naming and explicit methods over clever abstractions.
- If a decision is ambiguous, choose the simplest scalable option consistent with these rules.

# Libraries

- react
- typescript
- mobx
- mobx-react-lite
- react-router-dom
- antd
