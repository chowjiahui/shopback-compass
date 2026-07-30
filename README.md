# ShopBack Compass

## Problem

ShopBack is organised around supply where shoppers search by store. But people think in purchase goals like: "I'm planning a Japan trip," "I'm buying a new home'." This leaves shoppers to work out which stores stock what they need, which pay the best cashback, and which categories they've forgotten.

This is painful to do at big, infrequent life moments — a trip, a new home, a new car — that bundle a dozen purchases at once. What's broken is the effort consumers have to spend searching across many stores, and the blind spots (the travel insurance or home cover no one thinks to check ShopBack for).

Commercially, ShopBack only sees that intent late (eg, after the hotel is booked), missing the moment it could have shaped multiple big-ticket purchases.

## Solution 

For consumers, tell ShopBack what you want, and it returns the smartest way to get it: multiple purchases and categories, ranked by real cashback, with the easily-missed high-value items (insurance, eSIM, the right card) surfaced up front. 

I built a working prototype in a day on ShopBack SG's shop catalogue. Type "house purchase " and it assembles flights, hotels, activities, travel insurance, eSIM and a travel card with real merchants ranked, under a headline of total cashback and hours saved.

An LLM is first used for understanding the purchase goal, and breaks it down into sub-categories. Right now, this is done more comprehensively with travel, but there are richer purchase intents that Shopback hasn't captured. 
Next, the sub-categories are matched against Shopback's brands catelogue with embeddings, done concurrently to make the search results load faster. 

At scale, depending on coverage across Shopback's multiple markets and merchants, some user queries might not return rich results. We might also need to look up trust and regulation on FS/insurance. Right now this is positioned as "compare & decide," and because the shopper asks, it avoids the user opt-outs that a proactive insurance push triggers.

## The Why

By capturing intent higher up the funnel, Shopback has bigger opportunities to steer the whole basket toward the highest-margin verticals (travel, financial services, electronics) at the moment of need. For merchants, it's a new, intent-qualified demand surface: a shopper who's declared "new home" is a premium, co-fundable audience (retail media). The payoff is more GMV routed through ShopBack, a richer high-margin mix, and higher frequency (a reason to open ShopBack before deciding, not just at checkout). 

![Compass — a Japan-trip plan](docs/screenshot-plan.png)

## How it works — and where an LLM is *not* used
- **Real data.** Built on ShopBack SG's actual catalogue (**1,184 live stores**) with cashback rates + fine print scraped from their public store pages. See `public/data/`.
- **LLM decomposes; code retrieves and ranks.** An LLM turns a fuzzy goal into labelled sub-needs and picks relevant stores — the one genuinely reasoning-shaped step. **Retrieval and cashback ranking are deterministic** (no model), and the model is **grounded to real store slugs**, so it can never invent a store, rate, or caveat.
- **Two paths.** The hero intents (Japan trip / new home) render from curated real data; any **free-text** goal is decomposed live via `/api/plan`.

### Scaling (not built here)
At 20k+ merchants, build-time **embeddings** replace hand-tagging for retrieval, while the LLM still does the decomposition; the same engine could also run proactively off ShopBack's cross-merchant purchase graph.

## Tech
Next.js (App Router) · TypeScript · Tailwind v4 · Vitest. LLM via any OpenAI-compatible endpoint (configured for DeepSeek by default).

## Run locally
```bash
npm install
cp .env.local.example .env.local   # add your LLM key
npm run dev                          # http://localhost:3000
npm test                             # ranking + grounding unit tests
```

## Disclaimer
Independent prototype for a product exercise. **Not affiliated with or endorsed by ShopBack.** ShopBack branding and merchant names belong to their respective owners; cashback rates are a point-in-time snapshot and may be out of date.
