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
Superseded by D-041
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
Superseded by D-056
Decision: The service worker always tries the internet first and saves a fresh copy; it uses the saved copy only when offline.
Why: During development, changes show up on the phone at the next online visit, with no "stuck on the old version" confusion. Can be revisited before v0.1 release.

### D-040 Placeholder icons and offline status line
Approved · 2026-10-06 · Tech Lead + Product Owner
Decision: Two simple placeholder PNG icons (192 px, 512 px) and one small status line on the placeholder screen reporting whether offline support is ready.
Why: Android needs icons to install the app properly. The status line lets the Product Owner verify the service worker without developer tools. Both are replaced in Milestone 02.

---

## Milestone 02 — Design system

### D-041 Display typeface: Bricolage Grotesque (supersedes D-034)
Approved · 2026-10-07 · Tech Lead + Product Owner
Decision: Bricolage Grotesque (OFL) for display, titles and section headings. Aminute is retired as a reference. Prata was considered and set aside for now.
Why: Closest free match to the editorial, slightly quirky headline feel of the visual direction; variable weights 200–800.

### D-042 Body / UI typeface: DM Sans
Approved · 2026-10-07 · Tech Lead + Product Owner
Decision: DM Sans (OFL) for body text, labels, metadata and buttons.

### D-043 Design System v0.1
Approved · 2026-10-07 · Tech Lead + Product Owner
Decision: Colors, type scale, spacing scale, radii, component list, photo behavior and accessibility rules follow Appendix B.
Why: A small, fixed set of values keeps every screen consistent and is easy to change in one place.

### D-044 Card palette includes aqua; no blue
Approved · 2026-10-07 · Tech Lead + Product Owner
Decision: Card colors are salmon, mint, cream, yellow, lavender and aqua (`#8ED6CB`, e.g. Salads). The optional blue is dropped.

### D-045 Heart color is semantic only
Approved · 2026-10-07 · Tech Lead + Product Owner
Decision: `heart` `#E0453A` is used only for the Favorite state, never as a decorative palette color.

### D-046 Illustrations: flat vector SVG
Approved · 2026-10-07 · Tech Lead + Product Owner
Decision: Category and empty-state illustrations are flat SVG, 2–3 tones per object, no outlines, palette-friendly. About 8 assets, produced by the Product Owner.

### D-047 Photo masks supplied by the Product Owner
Approved · 2026-10-07 · Tech Lead + Product Owner
Decision: 4–6 SVG masks named `blob-1.svg` … `blob-6.svg` in `masks/`: single closed path, no stroke, solid fill, viewBox `0 0 100 100`. A temporary `blob-1.svg` placeholder is used until delivered. Replacing the file requires no code change.

### D-048 No per-ingredient icons in v0.1
Approved · 2026-10-07 · Tech Lead + Product Owner
Decision: Ingredient rows are text only.

### D-049 Photos are masked, not cut out
Approved · 2026-10-07 · Tech Lead + Product Owner
Decision: User photos are shown inside organic masks on a color backdrop. No background removal (it would require AI, out of scope per D-002).

### D-050 Self-hosted fonts
Approved · 2026-10-07 · Tech Lead + Product Owner
Decision: Font files (Latin subset, variable weight, WOFF2) are stored in the repository under `fonts/` with their OFL license files, and cached by the service worker. Google Fonts' servers are not used.
Why: Fonts loaded from Google are not saved for offline use by our service worker (it only handles our own site), so offline the app would fall back to system fonts. Self-hosting is free, works offline, adds ~78 KB, and sends no visitor data to a third party.

### D-051 Interface icons: Lucide
Approved · 2026-10-07 · Tech Lead + Product Owner
Decision: Interface icons come from Lucide (ISC license), embedded as inline SVG. No icon library is loaded.
Why: Free, consistent 2 px rounded line style matching Appendix B; inline SVG needs no extra files or requests.

### D-052 Temporary Design Lab page
Approved · 2026-10-07 · Tech Lead + Product Owner
Decision: `lab.html` (styled by `css/lab.css`) shows every design-system piece for review on the phone. Both are temporary and are deleted once real screens replace them.

---

## Milestone 03 — Recipe Detail

### D-053 Recipe Detail: continuous vertical layout
Approved · 2026-10-07 · Tech Lead + Product Owner
Decision: Recipe Detail reads top to bottom like an editorial cookbook: Photo → Recipe identity → Metadata → Ingredients → Let's cook → Notes → Source. No tabs for Ingredients / Steps / Nutrition.
Why: A recipe should read naturally in one scroll, not be split across tabs.

### D-054 Screens are built from data
Approved · 2026-10-07 · Tech Lead + Product Owner
Decision: Each screen is a JavaScript function that receives data (e.g. one Recipe v1 object) and builds the screen. Code is split into small files loaded as native browser modules (no build step): `js/screens/` (screens), `js/ui/` (shared pieces), `js/format.js` (display text), `js/data/` (sample data), `js/pages/` (what each page shows). Text from data is always inserted as plain text, never as HTML. Interface icons live in one shared file, `icons/ui.svg`.
Why: Swapping the sample recipe for one from the device database later changes one line, not the screen. Plain-text insertion keeps user-typed content from breaking the page.

### D-055 Recipe Detail lives at recipe.html for now
Approved · 2026-10-07 · Tech Lead + Product Owner
Decision: Until navigation between screens exists, Recipe Detail is its own page (`recipe.html`), reached from the placeholder start page. How screens connect (one page with in-app navigation vs separate pages) is decided when My Recipes (Milestone 05) needs to open a recipe.
Why: Avoids committing to a navigation approach before there are two screens to connect. The screen function (D-054) works either way.

### D-056 Service worker: network first with a 3-second limit (supersedes D-039)
Approved · 2026-10-07 · Tech Lead + Product Owner
Decision: Keep network first, but if the network has not answered within 3 seconds, show the saved copy. After one failure, skip the network for 30 seconds so the rest of the page loads instantly from the saved copy. A late network answer still refreshes the saved copy.
Why: On the Product Owner's phone in airplane mode the app stayed on its splash screen. When something (e.g. a VPN) makes the phone look connected, requests never fail; they just wait. D-039 waited forever. Tested: with a network that never answers, Recipe Detail now opens in about 3 seconds; truly offline it opens instantly.

### D-057 Servings appear only in Ingredients
Superseded by D-058
Decision: The Recipe Detail metadata row shows total time and optional calories only. Servings appear in the Ingredients section with the serving stepper.
Why: Avoids showing the same information twice.

### D-058 Recipe Detail metadata shows "Serves N" (supersedes D-057)
Approved · 2026-10-07 · Tech Lead + Product Owner
Decision: The metadata row shows total time, optional calories and "Serves 4" (the recipe's base servings). The Ingredients section keeps its serving stepper.
Why: The recipe's yield belongs to its identity at a glance; the stepper is the tool for changing it.

---

## Milestone 04 — Technical checkpoint (D-005)

### D-059 Stay vanilla JavaScript for Create/Edit
Approved · 2026-10-07 · Tech Lead + Product Owner
Decision: Milestone 04 is built in plain HTML/CSS/JavaScript (no Svelte, no build step). Dexie is added as one self-hosted file. Forms follow one pattern: a draft Recipe v1 object is the single source of truth; typing updates the draft without redrawing; adding, removing or reordering rows redraws only that list; saving runs validate() and then stores the draft. Screens never call Dexie directly (only `js/db/`), and `js/model/` contains no screen code.
Re-evaluate Svelte at the Milestone 04 gate if: screen/data sync bugs need fixing more than once; the form screen file grows past ~400 lines; or a later milestone needs the same data live on several screens at once.
Why: Svelte would only shorten the form code. It would add a build pipeline the Product Owner cannot see into, require rebuilding working screens, and add ongoing tool upkeep. Data model, database, parsing and photo code would transfer unchanged if a migration is ever needed.

---

## Milestone 04 — Task 004A: device storage

### D-060 Database schema version 1
Proposed · 2026-10-07 · Claude
Decision: IndexedDB database `sazon`, managed by Dexie 4.4.6 (self-hosted at `js/vendor/dexie.mjs`). Version 1 has the four stores of D-016, with these indexes: `recipes`: id, title, createdAt, updatedAt, categoryIds (multi-value); `categories`: id, order; `photos`: id; `settings`: id. All other Recipe v1 fields are stored unindexed. Future changes add `version(2)`; version 1 is never edited. Recipe Detail opens a stored recipe at `recipe.html?id=<UUID>`.
Why: Indexes cover the lookups planned for v0.1 (open by id, sort by name/date, filter by category). `isFavorite` is not indexed because IndexedDB cannot index true/false values; favorites are filtered in memory (fine at personal-collection size).

### D-061 Temporary development seed and storage check
Proposed · 2026-10-07 · Claude
Decision: When the recipes store is empty, the Tacos de pollo sample is stored once (fixed UUID, so it can never be duplicated). The start page shows a temporary "DEV · Storage check" panel, and Recipe Detail opened from the start page shows a small "DEV" line naming its source. All of it (`js/dev/`, `css/dev.css`, `js/db/seed.js`) is removed once recipes can be created in the app.
Why: Lets the Product Owner verify the database on the phone without developer tools. Known limitation while it exists: deleting every recipe would bring the sample back on the next launch.

### D-062 Ask for persistent storage
Proposed · 2026-10-07 · Claude
Decision: The app asks the browser to keep its data (`navigator.storage.persist()`) and reports the answer honestly. "Not granted" means the browser may clear app data under storage pressure; backup/export (D-009) remains the real protection.
Why: Chrome decides by itself (no prompt), usually granting it to installed, frequently used apps; it cannot be forced.

---

## Open questions

- ~~Q-1 App UI language~~ → resolved by D-033.
- ~~Q-2 Aminute web-embedding license~~ → closed; Aminute retired as reference (D-041).
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

---

## Appendix B — Design System v0.1

Tokens live in `css/tokens.css`; this table is the reference.

**Color**

| Token | HEX | Use |
|---|---|---|
| `bg` | `#F2E6DF` | App background |
| `surface` | `#FAF3EE` | Raised neutral cards, sheets, bottom nav |
| `surface-sunken` | `#E9DCD4` | Inputs, inactive pills |
| `ink` | `#221C19` | Primary text and icons; the only text color on card colors |
| `ink-soft` | `#5E514A` | Secondary text on neutral backgrounds only |
| `line` | `#D9C8BE` | Decorative dividers only |
| `salmon` | `#FB8E80` | Card |
| `mint` | `#BCD9C7` | Card |
| `cream` | `#F6EBD9` | Card |
| `yellow` | `#FDD873` | Card, primary action, selected state |
| `lavender` | `#C8B0FA` | Card |
| `aqua` | `#8ED6CB` | Card |
| `heart` | `#E0453A` | Favorite state only |

Never white text on the palette.

**Type**

| Role | Family | Size / line-height | Weight |
|---|---|---|---|
| Display | Bricolage Grotesque | 40 / 1.0, −2% tracking | 600 |
| Title | Bricolage Grotesque | 32 / 1.05, −2% tracking | 600 |
| Section | Bricolage Grotesque | 22 / 1.15 | 600 |
| Body | DM Sans | 16 / 1.5 | 400 |
| Label / button | DM Sans | 15–16 / 1.2 | 500–600 |
| Metadata | DM Sans | 13 / 1.3 (minimum size anywhere) | 500 |

**Spacing:** 4 · 8 · 12 · 16 · 24 · 32 · 48 px. Screen margin 16, card gap 12, card padding 16, section gap 32.

**Radius:** large card 24 · small card / list row / input 16 · buttons, pills, chips fully rounded · icon buttons circular · photos use SVG masks.

**Components:** Button (primary, secondary, action card) · Icon button · Chip / pill · Segmented control · Stepper · Recipe card · Category card · Meta item · List row · Step item · Input (text, multi-line, select row) · Top bar · Bottom navigation (4 tabs + central add) · Photo frame.

**Photo behavior:** color backdrop (`appearance.color`) + organic mask (`appearance.mask`) + CSS treatment (`natural`, `warm`, `tint`). No photo → category illustration on the card color inside the same mask.

**Accessibility:** tap targets ≥ 48 × 48 px · minimum text 13 px · selected states use more than color alone · visible focus outline.
