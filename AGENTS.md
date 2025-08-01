# Guidelines for Codex Agents

This project uses SvelteKit with TypeScript and relies on Node 20+.
Follow these rules when modifying files under this repository:

- **Indentation:** keep the existing style in each file (tabs or two spaces as found).
- **Testing & Linting:** whenever you change any `.js`, `.ts`, or `.svelte` files, run:
  ```bash
  npm run lint
  npm run test
  ```
  Capture and report the output in your PR.
- **Commits:** use short Conventional Commit style messages such as `feat: add search` or `fix: login bug`.
- **Branching:** create feature branches from the `developer` branch when contributing.
- **Pull Requests:** provide a concise summary of your changes and mention any related issues.
