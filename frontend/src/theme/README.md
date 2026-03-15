# DarkEarn Theme Configuration

Global styling configuration for the DarkEarn app. Edit `src/theme/index.ts` and `src/styles/globals.css` to change the look and feel.

## Quick Reference

| Token | Usage |
|-------|-------|
| **Fonts** | `theme.font.family.sans`, `theme.font.size.heading.h1`, etc. |
| **Accent** | `theme.color.accent` (#e8ff00) |
| **Secondary** | `theme.color.secondary` (#888) |
| **Complementary** | `theme.color.complementary` (#22c55e) |
| **Background** | `theme.color.background.primary`, `.secondary`, `.tertiary` |

## Font Sizes

- **Heading**: h1 (40px), h2 (32px), h3 (24px), h4 (20px)
- **Subheading**: lg (18px), md (16px), sm (15px)
- **Text**: lg (16px), md (14px), sm (13px), xs (12px)
- **Caption**: md (11px), sm (10px)

## Colors

- **Accent**: Primary brand color (neon yellow-green)
- **Secondary**: Muted text, secondary UI
- **Complementary**: Success states, positive actions
- **Background**: primary (main), secondary (cards), tertiary (elevated)

## Usage

### In React (inline styles)

```tsx
import { theme } from "@/theme";

<div style={{ color: theme.color.accent }}>...</div>
<div style={{ fontSize: theme.font.size.heading.h2 }}>...</div>
```

### In CSS / Tailwind

Use the `@theme` variables in `globals.css`. Tailwind generates utilities:

- `text-accent`, `bg-accent`, `border-accent`
- `text-secondary`, `text-muted`
- `text-heading-1`, `text-body-md`, etc.

### Sync Note

When changing `theme/index.ts`, update the matching values in `styles/globals.css` `@theme` block so Tailwind utilities (e.g. `bg-accent`, `text-accent`) stay in sync. Key tokens: `--color-accent`, `--color-bg-primary`, `--color-bg-secondary`, `--color-border`.
