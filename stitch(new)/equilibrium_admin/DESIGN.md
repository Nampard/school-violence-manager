# Design System Document

## 1. Overview & Creative North Star
**Creative North Star: "The Stoic Archivist"**

Administering school violence reports requires a delicate balance of absolute authority and empathetic calm. This design system moves away from the "cluttered dashboard" trope and toward a high-end editorial experience. We treat information not as data points, but as a narrative that requires clarity and focus.

To achieve this, the system employs **The Stoic Archivist** principle: a layout that feels like a meticulously organized physical dossier. We break the "software template" look through **intentional white space, tonal layering, and sophisticated typography** that prioritizes the Korean script's vertical and horizontal balance. By eschewing traditional borders and heavy shadows, we create a "Modern Workspace" that reduces cognitive load for administrators handling high-stress documentation.

---

## 2. Colors: Tonal Depth vs. Structural Lines
The palette is a sophisticated interplay of **Slate (Secondary), Indigo (Primary), and Soft Sage (Tertiary)**. This triad ensures the interface feels "human" rather than "clinical."

### The "No-Line" Rule
Designers are prohibited from using 1px solid borders to define sections. Layout boundaries must be established via **background color shifts**. 
*   Use `surface` for the base application background.
*   Use `surface-container-low` to define major sidebars or navigation zones.
*   Use `surface-container-lowest` (Pure White) for the primary content "sheets" to evoke the feel of high-quality paper.

### Surface Hierarchy
*   **Base Layer:** `surface` (#f8f9ff)
*   **Content Area:** `surface-container-low` (#eff4ff)
*   **Active Document/Card:** `surface-container-lowest` (#ffffff)
*   **Elevated Interaction:** `surface-container-high` (#dce9ff)

### Signature Textures & Glassmorphism
To add "soul" to the administrative experience:
*   **Hero CTAs:** Use a subtle linear gradient from `primary` (#2d409f) to `primary-container` (#4759b8) at a 135-degree angle.
*   **Floating Modals:** Use `surface-container-lowest` with a 80% opacity and a `24px` backdrop-blur. This creates a "frosted glass" effect that keeps the administrator grounded in their current context.

---

## 3. Typography: The Editorial Hierarchy
Optimized for **Pretendard**, the typography system treats administrative text with the respect of a legal publication.

*   **Display & Headlines:** Use `display-sm` for page titles. The generous tracking and `primary` color provide an authoritative anchor.
*   **Title Scale:** `title-lg` should be used for section headers within a report.
*   **Body Text:** `body-md` is the workhorse. For Korean text, ensure a line-height of `1.6` to `1.8` to maintain readability in long narrative blocks.
*   **Labels:** Use `label-md` in `secondary` (#515f74) for metadata. This keeps the UI quiet, allowing the actual report content to take center stage.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows and borders create "visual noise." We replace them with **The Layering Principle**.

*   **Natural Lift:** Instead of a shadow, place a `surface-container-lowest` card on a `surface-container-low` background. The slight contrast provides a "soft lift."
*   **Ambient Shadows:** If a card must float (e.g., a "Copy Block" being moved), use a shadow: `0px 12px 32px rgba(11, 28, 48, 0.06)`. The tint is derived from `on-surface` (#0b1c30) for a natural look.
*   **The Ghost Border:** For accessibility in form fields, use `outline-variant` (#c5c5d4) at **20% opacity**. It provides a "hint" of a container without breaking the editorial flow.

---

## 5. Signature Components

### A. The "Copy Block" Card
Specialized for violence reporting, these are the primary data units.
*   **Container:** `surface-container-lowest`, radius `lg` (8px).
*   **Status Indicators:** Use `tertiary-container` (Sage) for "Resolved" and `error-container` for "Urgent" status. These should be subtle background washes, not heavy badges.
*   **Visual Logic:** Forbid divider lines between label and content. Use a `label-sm` header followed by a `12px` vertical gap to the `body-md` text.

### B. Input vs. AI Generated Draft
*   **Standard Input:** Solid `surface-container-lowest` with a `ghost border`.
*   **AI Generated Draft:** Use a subtle gradient background from `surface-container-low` to `tertiary-fixed-dim` (Soft Sage). This visual "shimmer" indicates the content is machine-suggested and requires human review.

### C. Buttons & Chips
*   **Primary Button:** `primary` (#2d409f) background, `on-primary` (#ffffff) text. No border. Radius `md` (6px).
*   **Chips:** Use `secondary-container` (#d5e3fc) with `on-secondary-container` (#57657a) text. Forbid outlines; let the color fill define the shape.

### D. Form Fields
*   **Text Areas:** No bottom lines or heavy boxes. Use a soft `surface-container-low` fill. Focus state is indicated by a 2px `primary` underline—a nod to traditional "fill-in-the-blank" forms.

---

## 6. Do's and Don'ts

### Do
*   **DO** use white space as a structural element. If two sections feel too close, increase the padding rather than adding a line.
*   **DO** use Sage (`tertiary` tokens) for progress and "calm" states to balance the Indigo/Slate tones.
*   **DO** ensure all Korean text uses `letter-spacing: -0.02em` for better legibility at administrative lengths.

### Don't
*   **DON'T** use a radius larger than `xl` (12px) for any element; stay strictly within the `lg` (8px) or `md` (6px) scale to maintain a professional, "workspace" feel.
*   **DON'T** use pure black (#000000) for text. Always use `on-surface` (#0b1c30) to maintain tonal harmony.
*   **DON'T** nest more than two levels of cards. If a third level is needed, use a background color shift instead of a new container.