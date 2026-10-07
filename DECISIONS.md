# DECISIONS.md — Sazón (codename)

Canonical log of technical and product decisions for the project.
Both AIs read from this file; if anything elsewhere contradicts it, this file wins.

**Rules**
- One entry per decision, numbered `D-###`, never renumbered.
- Statuses: `Approved` · `Proposed` (awaiting review) · `Superseded by D-###`.
- Approved entries are never edited. To change one, add a new entry that supersedes it. Only the status line of a superseded entry changes.
- Gate process: Claude proposes → Tech Lead (ChatGPT) reviews → Product Owner (Jorge) has the final word → Approved.

**Entry format**
```
### D-### Title
Status · Date · Decided by
Decision: what we chose.
Why: the reason, in plain language.
```

---

## Product scope

### D-001 Product principle
Approved · 2026-10-06 · Product Owner
Decision: The app must be useful before it becomes intelligent. The architecture must not depend on AI.
Why: Core value is creating, finding and viewing recipes beautifully. AI can be added later (import from photo/text, assistance).

### D-002 Out of scope for v0.1
Approved · 2026-10-06 · Product Owner
Decision: No AI, automatic nutrition analysis, payments, subscriptions, social feed, followers, comments, or App Store / Google Play deployment.
Why: Keep the MVP small and zero-budget.

### D-003 Visual principle
Approved · 2026-10-06 · Product Owner
Decision: A recipe must look beautiful even with a bad photo or no photo at all.
Why: Users upload mediocre images; the design system (masks, color cards, illustrations) carries the aesthetic.

---

## Architecture

### D-004 Platform: mobile-first PWA
Approved · 2026-10-06 · Tech Lead + Product Owner
Decision: Progressive Web App, installable to the home screen, works offline.
Why: Zero cost, one codebase for all devices, no store fees or reviews. Can be wrapped for stores later if needed.

### D-005 Stack: plain HTML / CSS / JavaScript, no build step
Approved (provisional) · 2026-10-06 · Tech Lead
Decision: No framework, no build tools. Technical checkpoint when Create/Edit becomes complex; if state management becomes difficult, reconsider Svelte rather than let vanilla JS become unmaintainable.
Why: Nothing to install or update; the Product Owner never needs a terminal.

### D-006 Storage: IndexedDB via Dexie
Approved · 2026-10-06 · Tech Lead
Decision: All data stored on the device in IndexedDB, using Dexie as the only planned library.
Why: Built into every browser, handles photos, works offline. Dexie makes it far simpler and safer to write.

### D-007 Local-first, single device, no accounts, no sync
Approved · 2026-10-06 · Tech Lead
Decision: v0.1 has no login, no server and no syncing between devices.
Why: Accounts and sync require a backend, which v0.1 does not need.

### D-008 Sharing: image card + Web Share API
Approved · 2026-10-06 · Tech Lead
Decision: Sharing generates an image card of the recipe and opens the phone's native share menu. No public recipe links in v0.1.
Why: Real links need a server. The image card needs none and fits the editorial aesthetic.

### D-009 Backup: export / import
Approved · 2026-10-06 · Tech Lead
Decision: Users can export all data to a single file and import it back.
Why: Mitigates local data loss (browser data cleared, phone lost, storage evicted).

### D-010 Primary test device: Android
Approved · 2026-10-06 · Tech Lead
Decision: Test primarily on Android; keep the PWA platform-agnostic.

### D-011 Hosting and code storage
Superseded by D-035
Decision: Code kept on GitHub (free). App hosted on GitHub Pages or Cloudflare Pages (free); choice pending.

### D-012 Milestone order
Approved · 2026-10-06 · Tech Lead + Product Owner
Decision:
00 Decisions & data model → 01 Skeleton, live on phone → 02 Design system → 03 Recipe Detail (sample data) → 04 Create/Edit + device storage → 05 My Recipes + search + favorites → 06 Home → 07 Categories → 08 Servings + Metric/Imperial → 09 Photo styles/masks → 10 Sharing + backup/export.
Why: Data model first to avoid rework; deploy early so "works" means works on the phone; Recipe Detail first as the heart of the brand.

### D-013 Decision log
Approved · 2026-10-06 · Tech Lead
Decision: This file is the canonical technical/product decision log.

---

## Data model (Milestone 00)

### D-014 Identifiers are UUIDs
Approved · 2026-10-06 · Tech Lead
Decision: Every recipe, category, photo, ingredient and step gets a random unique ID (UUID), never a counter (1, 2, 3…).
Why: IDs stay unique across devices and backups, so future sharing, importing and provenance links never collide. Changing ID type later is the most painful migration possible.

### D-015 Schema version on everything that persists or leaves the app
Approved · 2026-10-06 · Tech Lead
Decision: The database, each recipe and backup files carry a `schemaVersion` number (starts at 1).
Why: Lets future versions of the app recognize and upgrade old data and old backup files.

### D-016 Four data stores
Approved · 2026-10-06 · Tech Lead
Decision: `recipes`, `categories`, `photos`, `settings`.
Why: Photos are large and kept separate so lists stay fast. Counts (e.g. "24 recipes") are calculated, never stored.

### D-017 Structured ingredients, stored as entered
Approved · 2026-10-06 · Tech Lead
Decision: Each ingredient = amount + unit + name (+ optional note and section). Values are stored exactly as the user entered them; scaling and unit conversion happen only on screen.
Why: Free text cannot be reliably converted or scaled. Storing converted values causes rounding drift every time units are toggled.

### D-018 Units and conversion rules
Superseded by D-028
Decision: Known units, mass↔mass and volume↔volume conversion only, tsp/tbsp never converted, 1 cup = 240 ml.

### D-019 Categories: separate list, many per recipe
Approved · 2026-10-06 · Tech Lead
Decision: Categories live in their own store. A recipe holds a list of category IDs (UI may allow only one at first). Predefined categories ship with fixed IDs (e.g. `cat_breakfast`) and can be renamed or hidden; custom ones can be created and deleted. Deleting a category never deletes recipes.
Why: Moving from one-category to many-categories later is a painful migration; starting with a list costs nothing.

### D-020 Photos stored separately, resized on device
Approved · 2026-10-06 · Tech Lead
Decision: Photos resized to ~1200 px plus a small thumbnail before saving; original full-size file is not kept. Visual style (mask, background color, treatment) stored as named keys, not as image edits.
Why: Small storage, fast lists, and the style can be changed anytime without re-processing the photo.

### D-021 Provenance
Approved · 2026-10-06 · Tech Lead
Decision: Each recipe has a `provenance` object: source type, source name, source URL, and an optional `basedOn` reference (original recipe's ID plus a snapshot of its title and author). No `createdBy` in v0.1; a user reference can be added once accounts exist.
Why: Supports credit and "adapted from" now and later, without accounts. The snapshot keeps the reference meaningful even when the original isn't on this device.

### D-022 Times, calories, favorites
Superseded by D-029

### D-023 Settings: one record
Superseded by D-030

### D-024 Deletion is permanent in v0.1
Approved · 2026-10-06 · Tech Lead
Decision: Deleted recipes are removed (with a confirmation). No "deleted" markers kept.
Why: Markers are only needed for sync, which is out of scope.

### D-025 Search
Approved · 2026-10-06 · Tech Lead
Decision: Search across title, description and ingredient names, done in memory, ignoring case and accents ("limon" finds "limón").

### D-026 Backup file format
Superseded by D-031

### D-027 Dates
Approved · 2026-10-06 · Tech Lead
Decision: All timestamps stored in ISO format, UTC (e.g. `2026-10-06T07:12:00Z`).

---

## Milestone 00 review amendments

### D-028 Units as app conventions (supersedes D-018)
Approved · 2026-10-06 · Tech Lead
Decision:
- Culinary conversions are **Sazón conventions**, not universal standards.
- Unit codes:
  - mass: `g`, `kg`, `oz`, `lb`
  - volume: `ml`, `l`, `tsp`, `tbsp`, `cup`, `fl_oz`
  - count: `none` (displays as "2 eggs", "1 avocado"), `piece`, `clove`, `slice`, `pinch`, `can`, `bunch`
  - special: `to_taste`
  - any other text = custom unit, displayed as typed, never converted
- Convert only mass↔mass and volume↔volume. Never volume↔mass.
- tsp and tbsp are not converted between Metric and Imperial views.
- Count, custom and `to_taste` units are never converted.
- Temperatures inside step text are not converted in v0.1.
- Exact conversion constants (tsp, tbsp, cup, fl_oz) are fixed and recorded here when Milestone 08 begins. Candidates: tsp 5 ml, tbsp 15 ml, cup 240 ml.
Why: Predictable, honest conversions without per-ingredient density data.

### D-029 Servings, times, calories, favorites (supersedes D-022)
Approved · 2026-10-06 · Tech Lead
Decision:
- `servings` is a required whole number: the amount the recipe is written for. Serving scaling is calculated from it.
- Prep and cook time stored separately in minutes, both optional (total shown on screen).
- Calories: optional, manually entered, per serving. No nutrition tab.
- Favorite is a yes/no on the recipe.
Why: Scaling needs a structured base. Splitting a total time into prep/cook later is impossible; summing is trivial.

### D-030 Settings (supersedes D-023)
Approved · 2026-10-06 · Tech Lead
Decision: A single settings record with `displayName`, `preferredUnits` (metric / imperial), `appearance` (light / dark / system), `lastBackupAt`. No avatar photo in v0.1.

### D-031 Backup format, provisional (supersedes D-026)
Approved (provisional) · 2026-10-06 · Tech Lead
Decision: One JSON file containing format name, schemaVersion, export date, all recipes, categories, settings and photos (photos encoded as text). Import upgrades older schema versions. If backup size becomes a problem, a future format may be a ZIP containing `data.json` plus separate photo files. ZIP is not implemented now.
Why: Simplest single-file format for v0.1.

### D-032 Recipe notes
Approved · 2026-10-06 · Tech Lead
Decision: Recipes have an optional free-text `notes` field.

### D-033 Interface language
Approved · 2026-10-06 · Tech Lead
Decision: v0.1 interface is in English. Interface text should be written so it can later be gathered in one place and translated (Spanish) without rewriting screens. No translation system is built now.
Why: Keep v0.1 small without blocking Spanish later.

### D-034 Display font
Approved · 2026-10-06 · Tech Lead
Decision: Aminute is a visual reference only until its web-embedding license is verified. A free alternative is chosen in Milestone 02 if needed.

### D-035 Hosting: GitHub Pages (supersedes D-011)
Approved · 2026-10-06 · Tech Lead
Decision: Code kept on GitHub (free). App hosted on GitHub Pages from Milestone 01.
Why: Free, and keeps code and hosting in one account.

### D-036 Recipe v1 structure
Approved · 2026-10-06 · Tech Lead + Product Owner
Decision: Recipe records follow Appendix A.

---

## Milestone 01 — Project skeleton

### D-037 Repository
Approved · 2026-10-06 · Tech Lead + Product Owner
Decision: GitHub repository named `sazon` (no accent), public. App URL: `https://<username>.github.io/sazon/`.
Why: Free GitHub Pages requires a public repository. Accents in repository names cause URL problems. The repository holds no personal data.

### D-038 Relative paths everywhere
Approved · 2026-10-06 · Tech Lead + Product Owner
Decision: All file references use relative paths (`./css/app.css`), and the manifest uses `start_url` and `scope` of `./`.
Why: The app lives in a subfolder (`/sazon/`), not at the domain root. Relative paths work in both cases, including a future custom domain.

### D-039 Service worker strategy: network first
Approved · 2026-10-06 · Tech Lead + Product Owner
Decision: The service worker always tries the internet first and saves a fresh copy; it uses the saved copy only when offline.
Why: During development, changes show up on the phone at the next online visit, with no "stuck on the old version" confusion. Can be revisited before v0.1 release.

### D-040 Placeholder icons and offline status line
Approved · 2026-10-06 · Tech Lead + Product Owner
Decision: Two simple placeholder PNG icons (192 px, 512 px) and one small status line on the placeholder screen reporting whether offline support is ready.
Why: Android needs icons to install the app properly. The status line lets the Product Owner verify the service worker without developer tools. Both are replaced in Milestone 02.

---

## Open questions

- ~~Q-1 App UI language~~ → resolved by D-033.
- Q-2 Aminute web-embedding license → pending verification (D-034).
- ~~Q-3 Hosting~~ → resolved by D-035.

---

## Appendix A — Recipe v1 structure

| Field | Type | Notes |
|---|---|---|
| `id` | text (UUID) | required |
| `schemaVersion` | number | required, `1` |
| `title` | text | required |
| `description` | text | optional |
| `categoryIds` | list of category IDs | may be empty |
| `servings` | whole number | required |
| `prepMinutes` | number | optional |
| `cookMinutes` | number | optional |
| `caloriesPerServing` | number | optional, manual |
| `ingredients` | list of Ingredient | may be empty |
| `steps` | list of Step | may be empty |
| `notes` | text | optional |
| `photoId` | photo ID | optional |
| `appearance` | `{ color, mask, treatment }` | named keys; defaults from category |
| `isFavorite` | yes/no | default no |
| `provenance` | Provenance | required, defaults to `own` |
| `createdAt` / `updatedAt` | ISO date, UTC | required |

**Ingredient:** `id`, `quantity` (number or empty), `quantityMax` (number or empty, for ranges), `unit` (code per D-028 or custom text), `name` (required), `note`, `section`.

**Step:** `id`, `text` (required), `photoId` (optional; not used in v0.1 interface).

**Provenance:** `sourceType` (`own` / `person` / `book` / `website` / `other`), `sourceName`, `sourceUrl`, `basedOn` (empty, or `{ recipeId, title, author }`).
