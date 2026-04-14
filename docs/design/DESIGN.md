# Design System Strategy: Administrative Excellence

This document outlines the visual and interactive standards for the school violence case management dashboard. Our goal is to move beyond the cold, "utilitarian" feel of traditional government software, replacing it with a high-end, editorial experience that conveys authority, empathy, and clarity.

## 1. Overview & Creative North Star: "The Digital Jurist"

The Creative North Star for this design system is **"The Digital Jurist."** 

In an environment dealing with sensitive information and case management, the UI must act as an impartial, organized, and sophisticated facilitator. We move away from the "clutter" of standard dashboards by embracing **intentional negative space** and **asymmetric balance**. 

Rather than a rigid, spreadsheet-like grid, "The Digital Jurist" uses high-contrast typography scales and layered surfaces to guide the eye. It is an editorial approach to data: information isn't just displayed; it is curated. The layout should feel like a premium broadsheet newspaper—structured and dense with information, yet incredibly breathable and easy to navigate.

---

## 2. Colors: Tonal Authority

The palette is anchored in deep, trustworthy blues and clinical, soft grays, punctuated by high-clarity status indicators.

### The "No-Line" Rule
To achieve a premium feel, **1px solid borders are prohibited for sectioning.** Boundaries between content areas must be defined solely through background color shifts. For example, a `surface-container-low` section should sit directly on a `surface` background. This creates a modern, seamless look that reduces visual "noise" and eye fatigue during long administrative sessions.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, physical layers. 
- **Base Layer:** `background` (#f6fafe)
- **Primary Work Areas:** `surface-container-low` (#eef4fa)
- **Interactive Cards:** `surface-container-lowest` (#ffffff)
- **Elevated Modals/Overlays:** `surface-bright` (#f6fafe)

By nesting a `surface-container-lowest` card inside a `surface-container-high` sidebar, we define importance through luminance rather than lines.

### The "Glass & Gradient" Rule
For floating action buttons or temporary overlays, use **Glassmorphism**. Combine `surface-variant` at 70% opacity with a `backdrop-filter: blur(12px)`. To provide a "soul" to the interface, use subtle linear gradients for primary actions, transitioning from `primary` (#3856c4) to `primary-container` (#6d89fa) at a 135-degree angle.

---

## 3. Typography: Editorial Clarity

We utilize two distinct typefaces to balance character with legibility.

*   **Display & Headlines (Manrope):** A geometric sans-serif used for `display-lg` through `headline-sm`. Its wide stance and modern proportions provide the "authoritative" voice of the system.
*   **Body & Labels (Inter):** The workhorse. Inter is used for all case notes, form fields, and data points. It is optimized for long-form reading and high-density text handling.

**Scale Usage:**
- **Case Summaries:** Use `title-lg` (Inter) for high readability in text-heavy descriptions.
- **Data Labels:** Use `label-md` (Inter) in `on-surface-variant` color for metadata to keep it distinct from primary content.

---

## 4. Elevation & Depth: Tonal Layering

We avoid traditional heavy drop shadows. Depth is achieved through the **Layering Principle.**

*   **Ambient Shadows:** When an element must "float" (like a dropdown or a "Copy to Clipboard" confirmation), use an extra-diffused shadow: `box-shadow: 0 8px 32px rgba(42, 52, 58, 0.06)`. The shadow color is derived from `on-surface` (#2a343a) to ensure it feels like a natural part of the environment.
*   **The "Ghost Border" Fallback:** In rare cases where accessibility requires a container edge (e.g., high-contrast mode), use a "Ghost Border": `outline-variant` (#a9b3bb) at 15% opacity. Never use 100% opaque borders.
*   **Dimensionality:** Use `surface-tint` (#3856c4) at very low opacities (2-5%) as an overlay on top-level containers to give them a subtle, blue-tinted professional sheen.

---

## 5. Components

### Cards & Lists (The Case Feed)
**Forbid the use of divider lines.** Separate case entries using vertical white space (using 24px or 32px gaps) and subtle background shifts between `surface-container-low` and `surface-container-lowest`.

### The 'Copy-to-Clipboard' Hub
Given the text-heavy nature of case management, "Copy" actions are prominent. 
- **Style:** Use a `surface-container-highest` background with an `on-surface` icon.
- **Interaction:** On click, the button should transform into a `success` (#4caf50 - inferred) state with a subtle `primary` glow.

### Buttons
- **Primary:** Gradient-filled (`primary` to `primary-container`), `lg` roundedness (0.5rem).
- **Secondary:** `surface-container-high` background with `primary` text. No border.
- **Tertiary:** Transparent background, `on-surface-variant` text, underlined only on hover.

### Structured Forms
Inputs use `surface-container-lowest` to "pop" against `surface-container-low` page backgrounds. The focus state should not be a thicker border, but a 2px `primary_fixed` outer glow with a soft blur.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use `manrope` for large numerical data (Case IDs, dates) to give them weight.
*   **Do** lean on the `secondary` and `tertiary` color tokens for "Draft" or "Pending" statuses to keep the UI calm.
*   **Do** use `surface-container-highest` for global navigation sidebars to anchor the layout.

### Don't
*   **Don't** use pure black (#000000) for text. Always use `on-surface` (#2a343a) to maintain a premium, soft-contrast look.
*   **Don't** use "Alert Red" for everything. Reserve `error` (#a8364b) for critical system failures or high-risk case flags; use `secondary` for general warnings.
*   **Don't** cram cards together. If the screen feels full, increase the `surface` (background) area rather than shrinking the content.

### Accessibility Note
While we prioritize a "no-line" aesthetic, always ensure the contrast ratio between `surface-container` tiers and `on-surface` text meets WCAG AA standards. The shift from `surface` to `surface-container-low` must be subtle but perceivable (at least a 3-5% difference in luminance).