---
name: DevUtils
description: Fast, private browser tools for technical work.
colors:
  surface-light: "#fafafa"
  surface-raised-light: "#ffffff"
  surface-muted-light: "#f5f5f5"
  text-strong-light: "#171717"
  text-muted-light: "#737373"
  border-light: "#e5e5e5"
  border-hover-light: "#a3a3a3"
  surface-dark: "#0a0a0a"
  surface-raised-dark: "#0a0a0a"
  surface-muted-dark: "#171717"
  text-strong-dark: "#f5f5f5"
  text-muted-dark: "#737373"
  border-dark: "#262626"
  border-hover-dark: "#525252"
  warning-ribbon: "#fbbf24"
typography:
  display:
    fontFamily: "Geist, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Geist, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: "Geist, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.5
  body:
    fontFamily: "Geist, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Geist, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "0.1em"
  mono:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  md: "6px"
  lg: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.text-strong-light}"
    textColor: "{colors.surface-light}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "{colors.surface-raised-light}"
    textColor: "{colors.text-strong-light}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  input:
    backgroundColor: "{colors.surface-raised-light}"
    textColor: "{colors.text-strong-light}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  tool-card:
    backgroundColor: "{colors.surface-raised-light}"
    textColor: "{colors.text-strong-light}"
    rounded: "{rounded.lg}"
    padding: "20px"
---

# Design System: DevUtils

## 1. Overview

**Creative North Star: "The Quiet Workbench"**

DevUtils should feel like a clean bench of measured instruments: everything is within reach, every control has a practical reason to exist, and nothing competes with the user's pasted data. The system is calm, precise, and intentionally low-noise, matching the product promise that technical work can happen quickly and privately in the browser.

The visual language is mostly flat and bordered. Grid lines, thin dividers, compact controls, and restrained typography create structure without turning the site into an ad-heavy tools portal. Craft lives in alignment, state clarity, copy economy, and predictable feedback.

**Key Characteristics:**

- Restrained neutral palette with rare functional color.
- Geist sans for clear product UI, Geist Mono for code and data.
- Flat surfaces separated by borders, tonal contrast, and sticky layers.
- Compact but breathable spacing for many utilities without clutter.
- State changes are visible, direct, and never theatrical.

## 2. Colors

The palette is a tinted-neutral workshop system: near-white and near-black surfaces, graphite text, hairline borders, and a single amber utility accent for exceptional labels such as beta status.

### Primary

- **Graphite Ink** (#171717): Primary light-mode text and primary button fill. Use it for decisive actions and high-emphasis labels.
- **Chalk Instrument Text** (#f5f5f5): Primary dark-mode text and inverse text on dark controls.

### Secondary

- **Amber Caution Tag** (#fbbf24): Reserved for beta ribbons and exceptional status. It should stay rare so it reads as a functional marker, not brand decoration.

### Neutral

- **Workbench Paper** (#fafafa): Preferred light page surface, softer than pure white.
- **Raised Sheet** (#ffffff): Current raised component surface for cards, inputs, menus, and tool panels.
- **Soft Graphite Field** (#0a0a0a): Dark-mode page and raised component surface.
- **Pencil Copy** (#737373): Muted descriptions, placeholders, and secondary navigation.
- **Hairline Rule** (#e5e5e5): Default light divider and component border.
- **Carbon Rule** (#262626): Default dark divider and component border.
- **Focused Rule** (#a3a3a3 light, #525252 dark): Hover and focus border emphasis.

### Named Rules

**The Rare Signal Rule.** Amber and any future accent color are for functional state only. They should not become decorative gradients, hero effects, or broad backgrounds.

## 3. Typography

**Display Font:** Geist with system sans fallbacks  
**Body Font:** Geist with system sans fallbacks  
**Label/Mono Font:** Geist Mono for code, tokens, timestamps, keyboard shortcuts, and generated output

**Character:** The pairing is technical without feeling cold. Geist carries navigation, forms, and explanatory copy; Geist Mono appears where the user's data or command context benefits from fixed-width scanning.

### Hierarchy

- **Display** (700, clamp(2.25rem, 5vw, 3rem), 1.05): Home hero and major page statements. Keep lines short and literal.
- **Headline** (600, 1.5rem, 1.2): Tool page section headings and major grouping labels.
- **Title** (500, 1rem, 1.5): Tool cards, panel titles, and actionable labels.
- **Body** (400, 1rem, 1.625): Descriptions, help text, and documentation blocks. Keep prose near 65-75ch.
- **Label** (500, 0.75rem, 0.1em tracking): Uppercase technical labels, field labels, and category headers.
- **Mono** (400, 0.875rem, 1.5): Textareas, code-like output, keyboard shortcuts, hashes, tokens, and payloads.

### Named Rules

**The Literal Label Rule.** Prefer concrete tool and control labels over clever phrasing. The typography should help users verify what will happen next.

## 4. Elevation

DevUtils is flat by default. Depth is conveyed through border contrast, tonal surface changes, sticky header layering, and hover/focus border shifts. Shadows are reserved for transient overlays such as the tools dropdown, where a shadow clarifies stacking rather than decorating a card.

### Shadow Vocabulary

- **Overlay Shadow** (`0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): Dropdown menus and floating command surfaces only.

### Named Rules

**The Flat-At-Rest Rule.** Cards, inputs, and panels do not need shadows at rest. If a surface is always visible, separate it with a 1px border and tonal contrast.

## 5. Components

### Buttons

Measured instruments: compact, rectangular, and obvious about state.

- **Shape:** Medium radius (6px), matching `.rounded-md`.
- **Primary:** Graphite fill with inverse text, `8px 16px` padding, `0.875rem` medium text.
- **Hover / Focus:** Shift fill or border one neutral step. Focus must be visible and should not rely on color alone where possible.
- **Secondary / Ghost:** Secondary buttons use a 1px border and raised sheet background. Ghost buttons are text-first and used for low-risk navigation or utility actions.

### Chips

Chips are not a dominant primitive yet. When used for categories or filters, keep them bordered, compact, and text-forward rather than pill-shaped decoration.

### Cards / Containers

- **Corner Style:** Large radius (8px), matching `.rounded-lg`.
- **Background:** Raised Sheet in light mode, Soft Graphite Field in dark mode.
- **Shadow Strategy:** No shadow at rest.
- **Border:** 1px Hairline Rule or Carbon Rule, with hover moving to Focused Rule.
- **Internal Padding:** Tool cards use 20px; larger panels use 24px.

### Inputs / Fields

- **Style:** 1px bordered raised surface, 6px radius, `12px` horizontal padding, mono text when handling code or payloads.
- **Focus:** Border shifts from Hairline Rule to Focused Rule. Keep outlines intentional and keyboard-visible.
- **Error / Disabled:** Disabled states reduce contrast and cursor affordance. Error states should combine copy with color or iconography rather than color alone.

### Navigation

The header is sticky, compact, and lightly translucent over the page surface. The wordmark uses the `//` code cue and lowercase `devutils`. Navigation links are quiet until hover. The search trigger behaves like an input-shaped command entry point with a visible keyboard shortcut.

### Signature Component: Tool Card Grid

Tool cards are compact discovery objects: title, short description, optional beta ribbon, and a border hover state. Avoid adding icons, badges, and descriptions until every card feels like a portal listing. The card should tell users what the tool does and get out of the way.

## 6. Do's and Don'ts

### Do:

- **Do** keep privacy and local processing visible in copy and interaction design.
- **Do** use 1px borders, neutral surfaces, and hover border changes to separate tools.
- **Do** reserve Geist Mono for user data, generated output, and command-like UI.
- **Do** keep action copy literal: Copy, Clear, Format, Decode, Generate, Download.
- **Do** maintain WCAG AA contrast for text, controls, focus states, and validation messages.

### Don't:

- **Don't** make DevUtils feel like an ad-heavy tools portal with cluttered SEO blocks, popups, sticky ad slots, or noisy banners.
- **Don't** use glossy SaaS gradients, hero metrics, inflated marketing copy, or decorative startup visuals.
- **Don't** use border-left or border-right greater than 1px as a colored card accent.
- **Don't** use gradient text.
- **Don't** rely on color alone for validation, diff, security, or status feedback.
