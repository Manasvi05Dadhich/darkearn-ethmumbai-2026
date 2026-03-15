/**
 * DarkEarn Global Theme Configuration  ---------basic style
 *
 * Single source of truth for fonts, colors, sizes, and other design tokens.
 * Change values here to update the app-wide styling.
 *
 * For CSS/Tailwind: sync key values to src/styles/globals.css @theme block.
 * For inline styles: import { theme } from "@/theme" and use theme.color.accent etc.
 */

export const theme = {
  // ── Fonts ─────────────────────────────────────────────────────────────
  font: {
    family: {
      sans: "'Space Grotesk', system-ui, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
    size: {
      heading: {
        h1: "2.5rem",      // 40px
        h2: "2rem",        // 32px
        h3: "1.5rem",     // 24px
        h4: "1.25rem",    // 20px
      },
      subheading: {
        lg: "1.125rem",   // 18px
        md: "1rem",       // 16px
        sm: "0.9375rem",  // 15px
      },
      text: {
        lg: "1rem",       // 16px
        md: "0.875rem",   // 14px
        sm: "0.8125rem",  // 13px
        xs: "0.75rem",    // 12px
      },
      caption: {
        md: "0.6875rem",  // 11px
        sm: "0.625rem",   // 10px
      },
    },
    weight: {
      bold: "700",
      semibold: "600",
      medium: "500",
      normal: "400",
    },
    tracking: {
      widest: "0.2em",
      wider: "0.1em",
      wide: "0.05em",
      normal: "0",
    },
  },

  // ── Colors ─────────────────────────────────────────────────────────────
  color: {
    accent: "#e8ff00",           // Primary accent (neon yellow-green)
    // accent: "#0018ff",           // Primary accent (neon yellow-green)
    accentHover: "#d4eb00",     // Darker on hover
    // accentHover: "#6A78FF",     // Darker on hover
    accentMuted: "rgba(232, 255, 0, 0.15)",
    accentSubtle: "rgba(232, 255, 0, 0.08)",
    accentBorder: "rgba(232, 255, 0, 0.2)",
    accentBorderHover: "rgba(232, 255, 0, 0.3)",

    secondary: "#888888",        // Secondary text / UI
    secondaryDark: "#666666",

    complementary: "#22c55e",    // Success / positive (green)
    complementaryMuted: "rgba(34, 197, 94, 0.15)",

    background: {
      primary: "#060606",        // Main app background
      secondary: "#0a0a0a",     // Cards, panels
      tertiary: "#111111",       // Elevated surfaces
      overlay: "#0c0c0c",       // Modal/dropdown overlay
    },

    surface: {
      card: "#0a0a0a",
      elevated: "#141414",
      overlay: "rgba(6, 6, 6, 0.95)",
    },

    // For text on accent (e.g. buttons)
    accentForeground: "#000000",

    border: {
      default: "#1a1a1a",
      subtle: "#222222",
      muted: "#333333",
    },

    text: {
      primary: "#ffffff",
      secondary: "#888888",
      muted: "#555555",
      disabled: "#333333",
      placeholder: "#cccccc",
    },
  },

  // ── Spacing ────────────────────────────────────────────────────────────
  spacing: {
    xs: "0.25rem",   // 4px
    sm: "0.5rem",    // 8px
    md: "1rem",      // 16px
    lg: "1.5rem",    // 24px
    xl: "2rem",      // 32px
    "2xl": "2.5rem", // 40px
  },

  // ── Radius ─────────────────────────────────────────────────────────────
  radius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    "2xl": "20px",
    full: "9999px",
  },

  // ── Shadows ────────────────────────────────────────────────────────────
  shadow: {
    glow: "0 0 20px rgba(232, 255, 0, 0.15)",
    glowStrong: "0 0 30px rgba(232, 255, 0, 0.25)",
    card: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
  },

  // ── Transitions ────────────────────────────────────────────────────────
  transition: {
    fast: "150ms ease",
    normal: "200ms ease",
    slow: "300ms ease",
  },
} as const;

export type Theme = typeof theme;
