# Vozila.hr — Design Direction

## Aesthetic Thesis
**Editorial garage. Cinema-black canvas, type that reads like a magazine masthead, photography that gets out of its own way.** Closer to a printed Porsche launch book than to any car portal alive in 2026.

## Keep / Replace
**Keep.** Pitch black `#000` background, Ferrari-red primary, Exo 2 + tracking-widest + `font-light`, sharp corners (`rounded-none`), the existing CSS variables (`--background`, `--foreground`, `--primary`, `--muted-foreground`, `--border`).

**Replace.** Frosted-glass search box (gimmicky), `rounded-2xl` on cards (off-brand — sharp edges everywhere else), `font-black` listing prices (Bring-a-Trailer uses elegant serifs and light sans for prices, never blackface), the gradient-blur image-behind-image trick on cards (it shrinks the photo when the photo is the product), the `shadow-2xl` lift on hover (clichéd SaaS).

## Hero Treatment
A **silent split-screen**: left 5/12 holds an oversized vertical numeric counter (`01 / 04`), the rotating headline (`AUDI A6 AVANT`), a thin red index rule, the search input as a single underlined line, and four category links as a typographic stack. Right 7/12 is a **changing full-bleed photograph** with a slow Ken-Burns scale on the active slide, indexed at the bottom-right with a Porsche-style four-rectangle progress meter that auto-advances every 6s. No frosted glass, no gradients on the image, no center-stacked everything. The asymmetry *is* the brand.

## Listing Cards (Bring-a-Trailer-grade)
Square or 5:4 photograph, **full-bleed `object-cover`**, no padding, no blur backdrop, no rounded corners. Below the photo: a generous 24px breath, then `MAKE · MODEL` in tracking-widest small caps, the price in **Exo 2 light, large**, and a single thin meta-line (`2021 · 45.000 km · 245 KS`) — no icons clutter. Hover state is the *photograph zooming* (1.04 over 700ms ease-out) and a single 1px red rule that draws in under the title. That's it. Trust the image.

## Signature Interaction — "The Index Rule"
A 1px red horizontal hairline (`hsl(3 90% 55%)`) that **draws from left to right on intersection-observe** every time a section enters the viewport. It appears under section labels, under card titles on hover, behind the active hero slide indicator, and as a slow-tick progress bar on the hero rotation. Same line, different speeds. It becomes the brand's identity — the way Linear has the diagonal stripe.

## Three Things to Delete
1. **The frosted-glass search panel** — replace with a single underlined input + filters as bare numeric fields below.
2. **`rounded-2xl` + `shadow-2xl` on listing cards** — sharp edges, no shadow, photography is the only chrome.
3. **The pinterest-tile category grid** with center-stacked icons + dark overlay + primary mix-blend tint — replace with editorial numbered marquee row.
