# Phase 2 backlog

Phase 1 shipped the Supabase-backed data layer, the procedural 3D kitchen
(desktop) and the grouped/swipeable inventory list (mobile), with search,
a right panel, a show-all modal, and a consumption modal. The architecture
established there — Server Components fetch (`src/app/page.tsx` →
`src/app/repositories/*.repository.ts`), Server Actions mutate
(`src/app/actions/inventory.actions.ts`, pattern:
`ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }`),
and `src/app/lib/inventory-helpers.ts` holds the shared zone/status/match
logic — is the foundation every feature below builds on. Each section is
written to be picked up cold, on its own branch, with no other context.

Reference docs for behavior/visual spec: `DESIGN_STRATEGY.md`,
`INFORMATION_ARCHITECTURE.md`, `USER_FLOWS.md` (all at repo root).

---

## 1. Recipes browser — `feature/recipes-browser`

**What it is:** the Suggested/Browse/Saved recipe tabs from
`DESIGN_STRATEGY.md`'s "Recipes (Mobile Primary)" section and
`USER_FLOWS.md` Flow 1/2 — currently only a stub of this exists (the
right panel's "Meal ideas" list on a single inventory item). This feature
makes Recipes a first-class screen on both desktop and mobile.

**Before writing code:** factor the meal-matching block out of
`src/app/components/right-panel.tsx` (the `mealIdeas` filter/sort using
`computeRecipeMatch` from `inventory-helpers.ts`) into a reusable function —
e.g. `findRecipesUsingIngredient(name, recipes, inventory)` in
`inventory-helpers.ts` — so the right panel and the new Recipes screen call
the same function instead of two copies of the same ranking logic.

**Data model additions (`supabase/schema.sql`):**
- `favorites` table: `id, recipe_id, created_at` (single-household, no user
  column yet — matches the rest of the schema's no-auth state). The HTML
  prototype used `localStorage`; don't — this app already has a backend,
  so favorites should survive across devices/browsers.

**New files:**
- `src/app/repositories/favorite.repository.ts` — `findAllFavoriteIds()`,
  `addFavorite(recipeId)`, `removeFavorite(recipeId)`.
- `src/app/actions/recipe.actions.ts` — `toggleFavorite(recipeId)` action
  wrapping the repository, following the same `ActionResult<T>` pattern as
  `inventory.actions.ts`.
- A Recipes screen component (desktop: a sidebar/section reachable from the
  left nav per `README.md`'s desktop layout; mobile: the `meals` screen
  referenced in the original HTML prototype's `screenCls`/`navCls` state
  shape, which this app's `home.tsx` doesn't yet implement navigation for —
  you'll need to add a simple screen router to `home.tsx`'s mobile branch,
  it currently renders `MobileInventory` unconditionally with no tabs).
- Recipe detail view reusing the ingredient have/missing layout style
  already established in `right-panel.tsx`'s item view (same `ingredient-row`
  / `match-bar` CSS classes already defined in `home.css`).

**Acceptance criteria** (from `USER_FLOWS.md` Flow 1 & `DESIGN_STRATEGY.md`):
- Suggested tab ranks by expiring-ingredient usage first, then match %
  (mirror the existing `_expCount`/`pct` sort the HTML prototype used).
- Browse tab has category filters (breakfast/lunch/dinner/dessert) and a
  text search across recipe name + ingredient names.
- Saved tab shows only favorited recipes; favoriting persists via the new
  `favorites` table, not `localStorage`.
- Recipe detail shows have/missing ingredients with quantities and a
  "Add missing to shopping list" action (stubbed until Shopping List below
  exists — land that feature, or this button, second).

---

## 2. Shopping List — `feature/shopping-list`

**What it is:** the Shopping screen from `DESIGN_STRATEGY.md` — a list
auto-populated from recipe gaps plus manual additions, with quantity
steppers and clear-list, per `USER_FLOWS.md` Flow 7.

**Data model additions:**
- `shopping_list` table: `id, name, quantity, unit, from_recipe (nullable
  text), created_at`. Keep it this simple — no need for a recipe foreign key
  since the prototype only ever displays the recipe name as a label, not a
  live link.

**New files:**
- `src/app/repositories/shopping.repository.ts` — `findAllShoppingItems()`,
  `addShoppingItem()`, `updateShoppingItemQty()`, `removeShoppingItem()`,
  `clearShoppingList()`.
- `src/app/actions/shopping.actions.ts` — thin `ActionResult<T>` wrappers,
  same pattern as `inventory.actions.ts`. Add a bulk `addMissingIngredients`
  action that takes a recipe id, computes the missing set with
  `computeRecipeMatch` (reuse, don't reimplement), and inserts all of them
  in one call — this is what the Recipes detail view's "Add missing to
  shopping list" button calls.
- A Shopping screen component, styled with the existing `.qty-stepper` /
  `.qty-btn` CSS classes already in `home.css` (used today by
  `consume-modal.tsx` — same visual pattern, different data).

**Acceptance criteria** (from `USER_FLOWS.md` Flow 7):
- Items show name + qty + (if added from a recipe) "for {recipe name}".
- Qty steppers increment/decrement using the same step-size logic as
  `consume-modal.tsx` (round to whole units, don't go below 0/1).
- "Clear list" empties it with one action.
- Badge count on the Recipes screen's "List" button (prototype had this —
  `hasShoppingItems`/`shoppingCount` in the HTML reference) should reflect
  `shopping_list` row count, fetched the same RSC-first way `page.tsx` does
  for inventory (don't add a third client-fetch pattern).

---

## 3. Scan / receipt — `feature/receipt-scan`

**What it is:** the mocked-OCR receipt flow agreed earlier in this project
(no real OCR integration) — `DESIGN_STRATEGY.md`'s Purchases (desktop) /
Scan (mobile) screens, `USER_FLOWS.md` Flow 5/6.

**New files:**
- Extend `inventory.actions.ts` (or a new `addItems` action alongside
  `addItem`) to accept an array and insert in one round trip rather than N
  sequential `addItem` calls from the client.
- A Scan/Purchases screen: canned sample-receipt text (same as the HTML
  prototype's hardcoded `receiptText`), a per-item zone-assignment `<select>`
  (reuse the `ZONES` constant from `inventory-helpers.ts` for the options —
  don't hardcode "Fridge/Freezer/Pantry/Spices" a second time), and a
  "Add N items to inventory" button calling the bulk action.

**Explicitly out of scope:** any real OCR/vision API call. If real OCR is
wanted later, it's a separate decision (which provider, image upload
storage, cost) — flag it as its own follow-up rather than smuggling it into
this branch.

**Acceptance criteria:**
- Clicking "Try a sample receipt" populates the same canned item list every
  time (deterministic, since there's no real parsing).
- Each detected item defaults to a sensible zone guess (e.g. dairy → Fridge)
  but is editable before committing.
- Committing adds all items in one action call and the inventory list
  (wherever the user lands next — desktop kitchen or mobile inventory)
  reflects them without a manual refresh.

---

## 4. Settings — `feature/settings-screen`

**What it is:** `DESIGN_STRATEGY.md`'s Settings screen — household,
storage zones, notifications.

**Important constraint to design around:** there is no auth/multi-user
system yet. Don't build UI that implies real multi-user behavior exists:

- **Household profile / "Invite Household Member"**: render as UI-only
  (static single user, invite button can be present but should say
  something like "Coming soon" or be disabled with a tooltip) rather than
  wiring a fake invite flow that looks functional but isn't.
- **Storage zones**: today `ZONES` is a hardcoded constant in
  `inventory-helpers.ts` (fridge/freezer/pantry/spices) and
  `src/config/kitchenZones.ts` has the matching 3D-position config for the
  same four zones. This is the **first feature that needs zones to become
  data-driven**: adding a custom zone from Settings would need a `zones`
  table, the inventory `location` field validated against it instead of the
  hardcoded enum-like list, and — if it should also appear in the 3D
  kitchen — a way to either fall back to a generic zone visual for
  user-created zones or accept that custom zones only show in the mobile
  list/right panel, not the 3D view. Decide this explicitly before starting;
  it's the riskiest part of this feature, not a routine CRUD screen.
- **Notifications**: store as a `user_prefs` row (or even a single-row
  table given no multi-user yet) with the two boolean toggles from the
  design doc (expiry alerts, weekly digest). No real notification delivery
  (email/push) — that's infrastructure (a cron job + an email provider) and
  should be its own follow-up, not bundled here.

**Acceptance criteria:**
- Zone list reflects whatever's in the new `zones` table (seeded with the
  current four so nothing regresses).
- Notification toggles persist and reload correctly; no fake "saved!" toast
  that doesn't reflect a real write.
