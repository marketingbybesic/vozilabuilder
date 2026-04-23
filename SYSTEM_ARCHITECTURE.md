# 🏗️ Vozila.hr - Core Architecture & AI Directives

## 1. ⚙️ The Tech Stack (Enterprise Monorepo)
* **Client:** React 18, TypeScript, Vite, Tailwind CSS 3, shadcn/ui.
* **Server:** Node.js, Express, TypeScript.
* **Database:** Supabase (PostgreSQL with PostGIS for location).
* **Storage:** Supabase Storage or Cloudinary (Images).
* **Validation:** Zod (Mandatory for ALL API inputs and form submissions).

## 2. 🧠 Architectural Rules (Zero Tolerance)
* **Single Source of Truth:** Database schemas, API payload keys, and internal logic MUST remain strictly in English (e.g., `make`, `model`, `price`).
* **Localization Isolation:** 100% strict Croatian (`hr-HR`) is ONLY applied at the visual UI layer. NEVER translate underlying data keys.
* **Dynamic Routing:** No fragmented, hardcoded category pages (No `Parts.tsx` vs `Cars.tsx`). Use a single `<ListingFeed />` driven by URL parameters (e.g., `/?category=automobili`).
* **Security First:** The backend MUST validate UUIDs and payloads via Zod. The frontend MUST catch 401/403 errors silently and redirect to `/login`.

## 3. 🎨 Aesthetic & UX Standards
* **Mathematical Spacing:** Tailwind padding/margins must follow strict scales (4, 8, 16, 24, 32, 48, 64). Layouts must be perfectly aligned using Flexbox or CSS Grid.
* **Premium Visuals:** Demand high-end, edge-to-edge photography with `object-cover`. Use sleek glassmorphism (`backdrop-blur-md bg-black/40`) for overlays.
* **Cinematic Micro-interactions:** Enforce `transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]`. Hover states should feature subtle scaling (`group-hover:scale-105`).
* **Flawless Dark Mode:** NO hardcoded `#ffffff` or `bg-white`. Use semantic Tailwind variables (e.g., `bg-background`, `text-foreground`, `bg-card`).

## 4. 🤖 AI Coding Directives 
* **Think Before Coding:** Always diagnose the root cause of an error before generating fixes.
* **Do Not Truncate:** When editing an existing file, output the full file OR explicitly use `// ... existing code ...` to prevent destructive overwrites.