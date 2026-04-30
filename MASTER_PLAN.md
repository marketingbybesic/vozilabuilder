# Vozila.hr — Master Plan to Disrupt Croatian Vehicle Marketplace

**Goal:** beat avto.net + njuškalo.hr in design craft, smart features, and trust-layer monetization. Become the default vehicle marketplace for Croatia within 18 months.

**Stack constraint:** free + low-cost APIs only. Stripe takes its standard cut on transactions. Everything else: Supabase, Resend, Claude Haiku, NHTSA vPIC, Sharp, OpenStreetMap.

---

## 1. Devil's advocate on incumbents

### njuškalo.hr (vehicles)
- **Wins:** brand familiarity, dealer mass, SEO dominance.
- **Loses:** 1990s ad-stack UI, no photography craft, weak per-category filters, opaque paid ranking, no escrow, no inspections, mobile is utilitarian.

### avto.net
- **Wins:** deeper subcategories, dealer-friendly tooling, better filters.
- **Loses:** civic-portal feel, monetization is just CPM + boost + dealer subs, no buyer financing, no transparent price intel.

### Both ignore
Verified mileage + VIN history, in-platform messaging with anti-scam guarantees, real-time financing offers, transport quotes, inspection network, post-sale services, sustainability filters (EV / charging / fuel cost), community.

### Where Vozila wins by being late
Modern stack lets us ship 10× UI craft + smart features at low cost. Croatia is a small enough market to dominate in 12-18 months. We sit between sellers and buyers as the **trust layer** — that's where the margin lives.

---

## 2. Monetization (multi-stream, not just ads)

Ranked by ARPU contribution × ease:

| # | Revenue line | Difficulty | Why it works |
|---|---|---|---|
| 1 | **Boost & Featured slots** (Stripe one-shot, 2/7/30 day) | Easy | Recurring impulse spend, FOMO, completion bias |
| 2 | **Dealer subscriptions** (Bronze/Silver/Gold) | Medium | Tiered badges, lead routing, analytics — dealers will pay |
| 3 | **Lead-gen for adjacent services** (financing, insurance, transport, inspection) | Medium | 5-50€/qualified lead. Hugely under-priced by njuškalo |
| 4 | **VIN history report** (5-15€/check) | Easy | Buyer about to spend 20k — high intent |
| 5 | **Escrow / buyer protection** (1-2.5% transaction fee) | Hard | High-trust = high conversion. Defensible moat |
| 6 | **Inspection network** (100€ Vozila-certified inspection + badge) | Medium-hard | Branded report, share to listing |
| 7 | **Marketplace for parts** (8-15% commission) | Easy | Already a category, just needs seller-side checkout |
| 8 | **Featured dealer ads on search** (per-impression) | Easy | Higher CPM than CPC |
| 9 | **Auction track** ("Aukcija") high-value cars + 5% buyer premium | Hard | Bring-a-Trailer plays this — premium positioning |
| 10 | **Premium tools for sellers** (auto-relist, AI copywriter, photo enhancement, weekly perf email) 10€/mo | Medium | Sticky recurring |
| 11 | **Display ads to non-paying users** (banks, tires, telco) | Easy | Last-resort revenue |

**Year 1:** lines 1, 2, 3 live. **Year 2:** 4, 9. **Year 3:** 5, 6.

---

## 3. Behavioral / "dopamine" UX (used ethically)

These are tactics that align user goal with platform goal. **Banned:** hidden charges, fake countdowns, fake "X people viewing", impossible-to-cancel subs.

### Allowed
- **Fresh-listing pulse** — "5 NOVA OGLASA" with 1px red ticker that animates in for 800ms when new listings land. Triggers return-visit habit.
- **Saved-search alerts** with email + browser push. Loss-aversion.
- **Price-drop notifications** for favorited listings. Endowment effect.
- **"Slično vozilo" KNN rail** at the bottom of every VDP. Even a failed search becomes a journey.
- **Streak / progress badges** for sellers — "3 oglasa ovaj mjesec, 75% performance". Gamifies dealer engagement.
- **Match-quality bar** on the listing card (✅ shipped Phase 0). "55/100" pill — quality signal at-a-glance.
- **Recently-viewed strip** persistent in localStorage (✅ shipped Phase 0). Endowment hook — once a buyer has viewed, they care.
- **Real social proof** — "Pregledao 18 ljudi danas". Real number, not made up. Drives urgency without lying.
- **Frictionless first listing** — 60-second seller wizard with VIN-first auto-fill (the "magic moment").
- **One-click contact funnel** — call / WhatsApp / message in one tap. Friction → 0.
- **Smart defaults on filters** — region from geolocation, sort by "Recommended" (weighted score), price range pre-set to local median ±30%.
- **Streak rewards for dealers** — auto-feature next listing free if last week had >X views.
- **Photo grading on upload** — "Photo 3 has glare. Want suggestions?" Better listings → more sales → seller comes back.
- **One-time micro-celebrations** on first sale or first listing. Human touch, not gimmicky.
- **Empty-state hooks** — "0 results? Try expanding radius. We'll save your search and email you when matches appear."

---

## 4. Build phases

### Phase 0 — Foundation (✅ shipping today)
- ✅ Distill categories (10 clean top-level)
- ✅ Real per-category filters config (cars 12+ filters, motos, boats, kampers, machines, etc.)
- ✅ Theme-aware Hero (light + dark)
- ✅ Vehicle-only photography (149 listings re-pointed to category-correct photos)
- ✅ Match Score badge per listing card (Premium / Solid / Basic)
- ✅ Recently-viewed localStorage strip on home
- ✅ Boolean filter type rendering
- ✅ Navigation distilled (10 categories) — bottom mobile nav at 4 items

### Phase 1 — Trust & monetization MVP (next)
- VIN quick-fill via NHTSA vPIC API (free) — magic moment in seller wizard
- Stripe Checkout boost integration (3 tiers: 2-day 5€, 7-day 15€, 30-day 49€) + webhook → set listing.is_featured
- Dealer subscription tier wiring (Stripe Subscriptions: Bronze 39€, Silver 99€, Gold 299€/mo) + verified-dealer badge workflow
- Saved-search localStorage + Resend email alerts (3000/mo free) on new matches
- Featured-listing pulse animation when new listings drop in feed
- Smart default filters from geolocation + median price

### Phase 2 — Differentiator features
- Weighted sort algorithm (uses matchScore + freshness + dealer tier)
- KNN "Slično vozilo" rail (Postgres-side cosine similarity on attributes)
- Fuel-cost-per-100km calc (algorithmic, no API)
- Visual history timeline on VDP (already partial)
- Damage-photo-only gallery with privacy gate
- Server-side image watermarking on upload (Sharp)
- AI listing copywriter (Claude Haiku, $0.0002/1k tokens) — "Generate description from photos + specs"
- Image quality grader (heuristic: blur, glare, low resolution)

### Phase 3 — Network effects
- Inspection partner directory + booking
- Financing partner integration (revshare with HR banks: PBZ, Erste, Zaba)
- Transport quotes (local partners; Anvil API as fallback)
- VozilaInspected program — 100€ inspection, branded report shareable on listing
- Public dealer profile pages with reviews
- Buyer reviews after sale (with proof)

### Phase 4 — Auctions & escrow
- Bring-a-Trailer-style "Aukcija" subdomain — 7-day timed auction, end-time pressure, bid increments, 5% buyer premium
- Stripe Connect escrow for high-value transactions
- Buyer protection guarantee marketing

---

## 5. Free / low-cost API stack

| Service | Use | Cost |
|---|---|---|
| Supabase | DB + Auth + Storage | Free 500MB / 2 GB egress |
| Stripe | Payments | Standard fees only |
| Resend | Email alerts | Free 3000/mo |
| Claude Haiku | AI copywriter, listing summaries | $0.0002 per 1k tokens |
| NHTSA vPIC | VIN decode | Free (US, 80% works for EU VINs) |
| Mapbox | Radius search map | Free 50k loads/mo |
| Sharp (npm) | Server-side image manip | Free |
| browser-image-compression | Client-side compression | Free, already a dep |
| OpenStreetMap Nominatim | HR geocoding | Free |
| Cloudflare Workers AI | Inference (free tier) | 10k tokens/day free |
| HuggingFace Inference | Embeddings for similarity | Free tier |

---

## 6. KPIs to track from day 1

- **Time to first listing post** (target: <90s with VIN auto-fill)
- **Listings with Match Score ≥ 80** (target: 40% within 90 days of launch)
- **Saved-search → email-click conversion** (target: 8%)
- **VDP → contact-action conversion** (target: 6%)
- **Repeat visit rate within 14 days** (target: 35%)
- **Dealer subscription conversion** from organic profile views (target: 2%)
- **Boost purchase rate** within 24h of listing creation (target: 12%)

---

## 7. Risk register

| Risk | Mitigation |
|---|---|
| Stripe fees stack on micro-transactions | Bundle boost + featured into single 7-day package |
| Service_role JWT denied write access | Already worked around via direct Postgres pooler in scripts/ |
| Image hot-link reliability | Already moved to local /img/categories/ for primary images |
| Croatian regulatory (GDPR for buyer/seller comms) | Existing GDPR consent banner; messages logged with retention policy |
| Dealer churn after first month | Streak rewards + analytics dashboards keep them sticky |
| Race to bottom on listing fees | Compete on trust + craft, not price |
| Single point of failure (Hostinger) | Mirror to Vercel as backup; one-click switch via DNS |

---

## 8. North-star vision

By **Q4 2026**, Vozila.hr is the default place a Croatian goes to buy or sell a vehicle — because:

1. The site is **so much more polished** than njuškalo that switching feels like an upgrade.
2. **VIN-first listing** makes posting a car feel magical (60s vs. 15min).
3. **Match Score + verified-dealer badges** give buyers confidence in a market full of scams.
4. **Saved-search alerts** keep them coming back.
5. **One-tap WhatsApp / call** kills friction.
6. **Vozila-Inspected + escrow** wraps the high-value transactions in trust.
7. **Auctions** become the destination for premium cars.
8. **Adjacent revenue** (financing, transport, inspection, parts) makes the unit economics sing.

Five revenue lines simultaneously. Sticky users. Defensible trust moat.

---

## 9. What's next, exactly

I'll continue plan→check→act loops on Phase 1, autonomously, until I either (a) need a paid API key from you, (b) need a design decision you should weigh in on, or (c) hit a structural blocker.

**Today's remaining cycles:**
- Featured-listing pulse on new arrivals
- Saved-search localStorage skeleton
- VIN quick-fill scaffold (NHTSA vPIC integration)
- Smart default filters (geolocation + median)
- Stripe Checkout scaffold (will need you to confirm before going live)

I'll commit each as a milestone and push to vozilabuilder main → testiranje.cloud auto-deploys.
