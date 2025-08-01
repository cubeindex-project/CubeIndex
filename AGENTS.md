# CubeIndex Project

CubeIndex is a full-stack web application with Svelte and TypeScript frontend and Node.js backend.
The core functionality lives in the `src/` folder.

## Build & Commands

- Start development server: `npm run dev`
- Build for production: `npm run build`
- Preview production build: `npm run preview`

### Development Environment

- Frontend dev server: http://localhost:5173
- Database runs on port 54321

## Code Style

- TypeScript: Strict mode with exactOptionalPropertyTypes, noUncheckedIndexedAccess
- Tabs for indentation (2 spaces for YAML/JSON/MD)
- Use JSDoc docstrings for documenting TypeScript definitions, not `//` comments
- Imports: Use consistent-type-imports
- Use descriptive variable/function names
- In CamelCase names, use "URL" (not "Url"), "API" (not "Api"), "ID" (not "Id")
- Prefer functional programming patterns
- Use TypeScript interfaces for public APIs
- NEVER use `@ts-expect-error` or `@ts-ignore` to suppress type errors

## Architecture

- Frontend: Svelte with TypeScript
- Backend: Express.js with TypeScript
- Database: PostgreSQL with Drizzle ORM and Supabase
- Styling: Daisy UI with Tailwind CSS
- Build tool: Vite
- Package manager: npm

## Security

- Use appropriate data types that limit exposure of sensitive information
- Never commit secrets or API keys to repository
- Use environment variables for sensitive data
- Validate all user inputs on both client and server
- Use HTTPS in production
- Regular dependency updates
- Follow principle of least privilege

## Git Workflow

- Run `npm run build` to verify typecheck passes
- NEVER use `git push --force` on the main branch
- Use `git push --force-with-lease` for feature branches if needed
- Always verify current branch before force operations

## Configuration

When adding new configuration options, update all relevant places:
1. Environment variables in `.env.example`
2. Documentation in README.md

All configuration keys use consistent naming and MUST be documented.