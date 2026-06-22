# Humanly — Design System

The single source of truth for Humanly's brand on the web. Brand tokens live in
`app/globals.css` (`@theme`); the logo lives in `public/logo.svg` + `app/icon.svg`.

---

## Logo

| Asset | File | Use |
| --- | --- | --- |
| Full lockup | `public/logo.svg` | The official Humanly logo (H-mark + "Humanly" wordmark). Used everywhere via `<BrandLogo />` |
| Favicon / square mark | `app/icon.svg` | Browser tab + Apple touch icon. Square crop of the H-mark from the same artwork |
| Component | `components/layout/BrandLogo.tsx` | Renders `public/logo.svg` at the height passed in `className` |

**Rules**
- Both assets are **transparent** (no cream/grey background) — the official logo PNG was background-keyed,
  trimmed, and embedded into `logo.svg` so the one file is the single source of truth.
- Mark anatomy: two purple→indigo gradient stems (the H), an orange radial-gradient dot at the
  crossbar, cream tick stubs, and the purple "smile" swoosh beneath.
- Minimum clear space ≈ the width of one stem. Don't recolour or redraw the logo; don't add effects.

## Color

Brand palette (from the official brand guide). Defined as CSS variables in `app/globals.css`.

| Token | Hex | Role |
| --- | --- | --- |
| `--color-primary-dark` | `#3f1b73` | Ink / primary purple, body headings, borders |
| `--color-primary-violet` | `#7c35e3` | Signature violet, accents, focus rings |
| `--color-violet-bright` | `#9d5cff` | Highlights, shadow pops |
| `--color-accent-orange` | `#fda544` | Brand secondary orange — primary CTA fill |
| `--color-orange-deep` | `#f26a1b` | Hover / deep orange, logo dot |
| Neutrals | `#fbf7f1` … `#1b1130` | Warm paper surfaces and ink |

Dominant purple with sharp orange accents. Keep palettes committed, not timid. Black/greys
(`#000`, `#5b5b5b`, `#a0a0a0`, `#dbdbdb`, `#fff`) are the flexible neutrals from the guide.

## Typography — Poppins everywhere

Loaded once in `app/layout.tsx` (weights 400/500/600/700/800). `--font-sans` and `--font-display`
both map to Poppins.

| Level | Weight | Token / usage |
| --- | --- | --- |
| Header | ExtraBold 800 | `--text-display`, `h1`, `.font-display` headings |
| Sub-header | SemiBold 600 | section sub-heads, eyebrows |
| Body | Regular 400 | `--text-body-md/lg`, paragraphs |
| Annotations | SemiBold 600 | captions, labels, meta |
| Buttons | Medium 500 | CTA labels |

Do **not** reintroduce Bricolage Grotesque or any secondary display face.

## Iconography

- Icons are **flat** (Lucide / Material Symbols). No outlines-as-default, no skeuomorphism.
- Two valid schemes: **purple fill + white glyph**, or **purple glyph on transparent**.
- The floating contact button is brand-exception green (`#25D366`) and links to `/contact`.

## Motion

- One orchestrated page-load reveal (staggered) beats scattered micro-interactions.
- Respect `prefers-reduced-motion` (already handled in `globals.css`).

## Voice & positioning

- Tagline: **"Your HR manages the workplace. We manage your career."**
- Positioning: **global-first**, with UAE / GCC / North America as regional guides — not the frame.
- Confidential, neutral, human. We provide HR guidance & coaching, **not legal advice**.
- Contact email: **hello@talkhumanly.com**.
