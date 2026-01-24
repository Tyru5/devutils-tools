# AGENTS.md

## Commands

- **Dev server**: `bun run dev`
- **Build**: `bun run build`
- **Format**: `bun run format` (check: `bun run format:check`)
- **Typecheck**: `bunx astro check` or `bunx tsc --noEmit`

## Architecture

- **Framework**: Astro 5 with React 18, Tailwind CSS, TypeScript (strict mode)
- **Output**: Static site deployed to Cloudflare Pages (wrangler.jsonc)
- **Structure**:
  - `src/pages/` - Astro pages (`[slug].astro` renders tools dynamically)
  - `src/components/tools/` - React tool components (one per tool)
  - `src/components/ui/` - Shared UI (Astro + React)
  - `src/lib/tools.ts` - Tool registry with metadata (slug, category, icon)
  - `src/layouts/` - Page layouts

## Code Style

- Use `@/*` path alias for imports (maps to `src/*`)
- React components: functional with hooks, PascalCase filenames
- Shared components in `src/components/tools/shared/` (Textarea, CopyButton)
- Prettier with astro + tailwindcss plugins; no semicolons enforcement
- Error handling: use `try/catch` with typed errors, display to user
