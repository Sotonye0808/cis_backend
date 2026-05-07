# Design System

> **Overview:** [FILL IN — Describes the visual language, component patterns, and UX principles for this project. Agents building UI must read this before writing any frontend code.]

---

## Visual Language

> **Section summary:** Core visual identity — colours, typography, spacing.

### Colour Palette

| Token | Value | Usage |
|-------|-------|-------|
| primary | [#hex] | [buttons, links, CTAs] |
| secondary | [#hex] | [accents, highlights] |
| background | [#hex] | [page background] |
| surface | [#hex] | [cards, modals] |
| text-primary | [#hex] | [main body text] |
| text-muted | [#hex] | [labels, captions] |
| danger | [#hex] | [errors, destructive actions] |
| success | [#hex] | [confirmations] |

### Typography

| Style | Font | Size | Weight |
|-------|------|------|--------|
| Heading 1 | [font] | [size] | [weight] |
| Heading 2 | [font] | [size] | [weight] |
| Body | [font] | [size] | [weight] |
| Caption | [font] | [size] | [weight] |
| Code | [font] | [size] | [weight] |

### Spacing Scale

[e.g. 4px base unit: 4, 8, 12, 16, 24, 32, 48, 64]

---

## Component Patterns

> **Section summary:** Standard UI components used across the project. New components should follow these patterns before inventing new ones.

### Buttons
- Primary: [describe style and usage]
- Secondary: [describe]
- Destructive: [describe]
- Disabled state: [describe]

### Forms
- Input fields: [style and validation rules]
- Error messages: [placement and style]
- Submit buttons: [loading state behaviour]

### Navigation
- [describe nav pattern: sidebar / topnav / tabs]

### Cards / Containers
- [describe card pattern, shadow, border radius]

### Modals / Dialogs
- [describe pattern for confirmations, forms, alerts]

---

## UX Principles

> **Section summary:** Guiding rules for how the interface should feel and behave.

1. [e.g. Always show loading state for async actions]
2. [e.g. Destructive actions require confirmation]
3. [e.g. Error messages must explain what the user can do to fix the problem]
4. [e.g. Mobile-first — all layouts must work at 320px wide]

---

## Responsive Breakpoints

| Breakpoint | Value | Target |
|------------|-------|--------|
| sm | [e.g. 640px] | Mobile |
| md | [e.g. 768px] | Tablet |
| lg | [e.g. 1024px] | Desktop |
| xl | [e.g. 1280px] | Wide screens |

---

## Accessibility Requirements

> **Section summary:** Minimum accessibility standards to follow.

- All interactive elements must have keyboard focus states
- Colour contrast must meet WCAG AA (4.5:1 for text)
- Images must have alt text
- Forms must have associated labels
