# DevUtils

A collection of free, fast, privacy-friendly developer utilities. Everything runs client-side — your data never leaves your browser.

## Tech Stack

- **Framework**: [Astro](https://astro.build) with React islands
- **Styling**: Tailwind CSS
- **Hosting**: Cloudflare Pages (recommended)

## Getting Started

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Project Structure

```
src/
├── components/
│   ├── ui/           # Astro components (static)
│   └── tools/        # React components (interactive)
├── content/
│   └── tools/        # MDX content for each tool
├── layouts/
│   └── ToolLayout.astro
├── lib/
│   └── tools.ts      # Tool metadata
├── pages/
│   ├── index.astro   # Homepage
│   └── [slug].astro  # Dynamic tool pages
└── styles/
    └── global.css
```

## Adding a New Tool

1. Add tool metadata to `src/lib/tools.ts`
2. Create React component in `src/components/tools/YourTool.tsx`
3. Create MDX content in `src/content/tools/your-tool.mdx`
4. Import and map component in `src/pages/[slug].astro`

## Available Tools

- [x] JSON Formatter & Validator
- [x] Base64 Encode/Decode
- [x] UUID Generator
- [x] URL Encode/Decode
- [x] Unix Timestamp Converter
- [x] Hash Generator (MD5, SHA-1, SHA-256, SHA-512)
- [x] JWT Decoder
- [x] Regex Tester
- [x] Diff Checker
- [x] Color Converter (HEX, RGB, HSL)

## Deployment

### Cloudflare Pages

1. Connect your GitHub repo to Cloudflare Pages
2. Build settings:
   - Framework preset: Astro
   - Build command: `bun run build`
   - Output directory: `dist`

### Other Platforms

Works with Vercel, Netlify, or any static hosting. Just run `bun run build` and deploy the `dist` folder.

## License

MIT
