# Code quality backlog — `fix/code-quality-pass`

Findings from a full-codebase audit (React/Next.js best practices, Clean
Code/SOLID, WCAG 2.1 AA, and UI/UX vs. the original design docs). None of
this is implemented yet — it's scoped here so it can be picked up cold on
its own branch, separate from Phase 2 feature work (see
`PHASE_2_BACKLOG.md`).

Suggested approach: one branch, tackled in the order below (each section is
independent enough to land as its own commit). If it turns out to be too
big for one PR, split at the section boundaries (`fix/ui-consistency`,
`fix/a11y`, `fix/react-nextjs`, `fix/clean-code`) rather than splitting
mid-section.

---

## 1. UI/UX vs. design docs

### 1.1 `add-inventory.tsx` modal has no dark theme (highest priority — visibly broken)
**File:** `src/app/components/add-inventory.tsx:81-82`
The content box (`<div className="p-6 rounded shadow-lg w-full max-w-md">`)
has no background-color class, and labels/inputs have no color classes
either — it inherits whatever `--foreground`/`--background` the OS color
scheme resolves to (see `globals.css`'s `prefers-color-scheme` block) instead
of the app's actual dark theme. Every other modal (`ConsumeModal`,
`ShowAllModal`) uses the polished `.sheet`/`.detail-backdrop` classes already
defined in `home.css`.
**Fix:** restyle using the existing `.sheet`/`.modal-header`/`.form-group`/
`.form-label`/`.form-input` classes from `home.css` (already used elsewhere —
see the design doc's "MODAL: Add Item" reference) instead of bare Tailwind
utility classes with no color tokens.

### 1.2 No top-level navigation exists
**File:** `src/app/components/home/home.tsx` (entire component)
The desktop left sidebar (Home/Recipes/Purchases/Settings) and mobile bottom
tab bar (Recipes/Inventory/Scan/Shopping/Settings) from the design docs were
never built. Right now there is no way to navigate anywhere — `home.tsx`
renders either the 3D kitchen+panel or `MobileInventory` with zero nav
chrome. Until Phase 2 screens exist, this looks unfinished/broken to anyone
landing on it.
**Fix:** at minimum, add the nav shell with disabled/"coming soon" states
for screens that don't exist yet (Recipes/Purchases/Settings on desktop,
Recipes/Scan/Shopping/Settings on mobile), so Inventory/Home is clearly one
tab among several rather than the whole app.

### 1.3 Empty zones show no visual indicator
**File:** `src/app/components/kitchen.tsx` (`STATUS_TINT.empty`)
Design calls for grey when a zone is empty; `STATUS_TINT.empty` is fully
transparent (`{ color: 0x000000, opacity: 0 }`), so an empty zone looks
identical to "nothing wrong" instead of visibly empty.
**Fix:** give `empty` a distinct grey tint (e.g. `0x666b7a` per
`USER_FLOWS.md`'s color spec) instead of opacity 0.

### 1.4 "Drag to look around…" hint reappears every recenter
**File:** `src/app/components/home/home.tsx` (`showKitchenHint`-equivalent
condition: `!focusedZoneId && !term`)
Spec'd as `kitchenHintVisible` — dismissed permanently after first
interaction, not re-shown every time the user recenters.
**Fix:** track "has the user ever interacted with the kitchen" as a
one-way `useState(false)` flag set on first zone click/search, instead of
deriving visibility purely from current focus state.

### 1.5 Smaller deviations
- Recenter button uses "←" instead of a home/⌂ glyph per the design.
- `layout.tsx` loads the Geist fonts but no CSS in the app references
  `var(--font-geist-sans)`/`var(--font-geist-mono)` — the UI actually
  renders in the hardcoded system-font stack from `home.css`. Either wire
  the CSS variable into `home.css`'s `font-family` or stop loading the font.

### 1.6 `README.md` is stale
**File:** `README.md`
Still describes Prisma/`DATABASE_URL`/`prisma migrate`/`prisma db seed`,
lists deleted files (`inventory-list.tsx`, `recipe-suggestions.tsx`,
`lib/prisma.ts`), and has no mention of Supabase, `supabase/schema.sql`,
`scripts/seed.ts`, or Server Actions. Anyone onboarding from it will set the
project up wrong.
**Fix:** rewrite to match the actual current setup (Supabase env vars,
`supabase/schema.sql` migration step, `npm run seed`, current project
structure tree).

---

## 2. WCAG 2.1 AA

### 2.1 3D zone selection has no keyboard/non-visual equivalent (2.1.1, 1.1.1)
**File:** `src/app/components/kitchen.tsx`
The only way to select a zone is clicking a 3D mesh. No keyboard path, no
text alternative for the canvas content.
**Fix:** add a visually-hidden (or progressively-disclosed) list of zone
buttons that call the same `onZoneClick` handler, so keyboard/screen-reader
users have a non-pointer way to reach every zone.

### 2.2 Clickable `<div>`s aren't keyboard-operable (2.1.1)
**Files:** `src/app/components/right-panel.tsx` (item rows),
`src/app/components/search-bar.tsx` (search results),
`src/app/components/show-all-modal.tsx` (item rows),
`src/app/components/mobile-inventory.tsx` (swipe rows)
`onClick` with no `role="button"`/`tabIndex={0}`/`onKeyDown` — not in tab
order, can't be activated with Enter/Space.
**Fix:** either switch these to real `<button>` elements (preferred —
simplest, free keyboard support) or add the role/tabIndex/onKeyDown triplet
consistently.

### 2.3 No focus management on modals/panels (2.4.3, 4.1.2)
**Files:** `src/app/components/right-panel.tsx`,
`src/app/components/show-all-modal.tsx`,
`src/app/components/consume-modal.tsx`
No `role="dialog"`/`aria-modal="true"`, no focus moved in on open, no focus
trap, no focus restored to the triggering element on close.
**Fix:** add the dialog role/aria-modal attributes; on mount, focus the
panel's first focusable element (or the panel container) and store/restore
the previously-focused element on unmount. Consider a small shared
`useFocusTrap`/`useDialog` hook since three components need the same
behavior (don't write it three times).

### 2.4 Dynamic content isn't announced (4.1.3)
**Files:** `src/app/components/home/home.tsx` (error banner),
`src/app/components/mobile-inventory.tsx` (select-bar "N selected")
No `aria-live` region — screen reader users aren't told when an error
appears or the selection count changes.
**Fix:** wrap the error banner text in `aria-live="assertive"`, the
select-bar count in `aria-live="polite"`.

### 2.5 Form labeling and icon-only buttons (1.3.1, 4.1.2)
**File:** `src/app/components/add-inventory.tsx`
Field labels are bare `<span>` instead of `<label htmlFor>` tied to the
corresponding `<input id>`; icon-only buttons (✎, 🗑️, ✕, ×) across this
file and others (`right-panel.tsx`, `mobile-inventory.tsx`) have no
`aria-label`.
**Fix:** convert `<span>` to `<label htmlFor="...">` matching each input's
`id`; add `aria-label` to every icon-only button (this should be folded into
fix 1.1's restyle pass since both touch the same file).

### 2.6 No `prefers-reduced-motion` handling (2.3.3)
**Files:** `src/app/globals.css`, `src/app/components/kitchen.tsx`
(continuous aura pulse), `src/app/components/perspective-camera.tsx`
(continuous camera oscillation)
Never checked anywhere in the app.
**Fix:** add a `prefers-reduced-motion: reduce` media query that disables
CSS keyframe animations, and check
`window.matchMedia('(prefers-reduced-motion: reduce)').matches` in
`CameraRig`/`ZoneAura` to skip the oscillation/pulse and hold a static pose
instead.

### 2.7 Contrast and color-only meaning (1.4.3, 1.4.1)
**Files:** `src/app/components/home/home.css` (`.kitchen-hint` color
`#8492A6`, `.item-meta`/`.stat-label` color `#A0A5B0` at 11-13px),
`src/app/components/search-bar.tsx` (`.search-dot`),
`src/app/components/kitchen.tsx` (zone aura tint)
Several secondary-text colors are borderline-to-failing 4.5:1 against their
backgrounds; zone freshness status in the 3D view is color-only (the floating
label only shows item count, not status).
**Fix:** bump `.kitchen-hint`/meta text colors to pass 4.5:1 against their
actual backgrounds; add a status word/icon to the zone label or aura (not
just count), and consider an icon or pattern alongside the search-dot color.

---

## 3. React / Next.js best practices

### 3.1 Server-side Supabase client has no more privilege than the browser
**File:** `src/app/lib/supabase.ts`
The only Supabase client uses the public anon/publishable key, and it's the
same client imported by `inventory.actions.ts`/the repositories running on
the server. There's no service-role client, so moving logic into Server
Actions doesn't actually buy any privilege separation — RLS policies written
for "what the browser can touch" are also "what the trusted server can
touch," with nothing stricter available server-side.
**Fix:** add a second server-only client (`src/app/lib/supabase-admin.ts`,
never imported by a "use client" file, built from a service-role key kept
out of `NEXT_PUBLIC_*`), and decide per-repository-function which client is
appropriate. This pairs with the already-documented RLS-is-fully-open
limitation from the Phase 1 hardening pass — same root cause, address
together.

### 3.2 Inline closures recreated every render passed into the R3F tree
**File:** `src/app/components/home/home.tsx` (`onZoneClick` prop to
`<Kitchen>`), `src/app/components/kitchen.tsx` (`handleClick` factory per
zone, `onPointerOver`/`onPointerOut` inline)
Every HomePage re-render (e.g. each keystroke in the search box) gives
`Kitchen` new function-prop references, and `Kitchen.handleClick` allocates a
fresh closure per zone on every one of its own re-renders.
**Fix:** wrap `onZoneClick` in `useCallback` in `home.tsx`; memoize
`handleClick` per zone in `kitchen.tsx` with `useCallback`/`useMemo` keyed by
zone id instead of a factory called inline in the `.map()`.

### 3.3 Recipes fetched twice with no shared cache
**Files:** `src/app/page.tsx` (passes `initialRecipes` from
`findAllRecipes()`), `src/app/api/recipes/route.ts`,
`src/app/api/recipes/suggestions/route.ts`
Both routes still exist and run the same query independently; nothing ties
their response to the `initialRecipes` prop already on the page, and
`revalidatePath('/')` in `inventory.actions.ts` doesn't invalidate them.
**Fix:** either remove the routes if nothing client-side actually calls them
anymore (verify first), or, if Phase 2 plans to use them, make sure any
future client-side fetch reads from the already-loaded data instead of
re-querying.

### 3.4 No memoization path for list-heavy children
**Files:** `src/app/components/home/home.tsx` (all handlers),
`src/app/components/mobile-inventory.tsx`,
`src/app/components/show-all-modal.tsx`
None of `home.tsx`'s handlers (`focusZoneAndItem`, `handleRecenter`,
`persistConsumption`, etc.) use `useCallback`, and the list-rendering
children aren't `memo`'d. Not a bug today, but the two need to be fixed
together before this becomes a real optimization (memoizing the child
without memoizing the callback prop is a no-op, and vice versa).
**Fix:** defer until inventory size is actually large enough to matter;
note here so it isn't "discovered" as a surprise later.

---

## 4. Clean Code / architecture

### 4.1 `home.tsx` mixes five responsibilities in one 290-line component
**File:** `src/app/components/home/home.tsx`
Derived-state computation, a focus/navigation state machine, server-action
orchestration, error-banner UI, and two near-duplicate desktop/mobile JSX
trees all live in one component. A fix applied to one branch (e.g. how
`ConsumeModal` is wired) is easy to forget in the other.
**Fix:** extract a `useKitchenFocus()` hook for the
pending/focused-zone/item state machine, and a `useInventoryActions()` hook
wrapping `persistConsumption`/`handleRemoveItem`/`handleCloseAddInventoryModal`
so `home.tsx` itself shrinks to composition + the two JSX branches.

### 4.2 Zone-matching logic duplicated three ways
**Files:** `src/app/lib/inventory-helpers.ts` (`groupByZone`,
`zoneIdFromLocation` — the canonical versions),
`src/app/components/home/home.tsx` (`zoneData` computed via an inline
`toLowerCase()` filter instead of calling the helpers),
`src/app/components/right-panel.tsx` (`mealIdeas` filter re-implements the
substring-match idea that `matchInventory` already encodes, instead of
calling it)
**Fix:** replace the inline filter in `home.tsx`'s `zoneData` with
`groupByZone`; replace `right-panel.tsx`'s inline ingredient-name matching
with `matchInventory`.

### 4.3 Three parallel vocabularies for "zone"
**Files:** `src/types/inventory.ts` (`Item.location: string`),
`src/app/lib/inventory-helpers.ts` (`Zone.name`),
`src/config/kitchenZones.ts` (`KitchenZone.location`)
All plain strings that must match case-insensitively, with nothing in the
type system tying them together — a typo in any one silently breaks zone
matching with no compiler error.
**Fix:** define a single `ZoneId` union (already exists in
`inventory-helpers.ts`) as the one source of truth, and have
`KitchenZone`/anywhere else that needs the display name derive it from
`ZONES` instead of carrying its own parallel `location`/`name` string.

### 4.4 `kitchen.tsx`'s zone→geometry mapping is a hardcoded if-chain (Open/Closed violation)
**File:** `src/app/components/kitchen.tsx` (`zone.id === "fridge" && ...`
chain)
A new zone added to `ZONES` would type-check and appear in search/right-panel
(both driven by data) but silently render no 3D geometry unless someone
remembers to add a branch here.
**Fix:** out of scope to fully fix until zones become data-driven (see
`PHASE_2_BACKLOG.md` §4 Settings), but at minimum add a fallback generic
zone mesh for any `zone.id` not explicitly handled, so a forgotten branch
degrades to "a plain box renders" instead of "nothing renders."

### 4.5 Hand-written field mapping duplicated three times
**File:** `src/app/repositories/inventory.repository.ts` (`toItem`,
`createInventory`'s insert payload, `updateInventory`'s update payload)
Adding a persisted field means touching three separate object literals;
missing one fails silently (field saves on create but never updates, or
vice versa) rather than at compile time.
**Fix:** define one camelCase↔snake_case mapping table/function and derive
all three from it.

---

## Verification

- `npx tsc --noEmit` and `npm run build` after each section.
- Manual keyboard-only pass (Tab/Enter/Space only, no mouse) through: search
  → pick a result → open right panel item → use/deduct → close, to confirm
  section 2 fixes actually restore a working keyboard flow.
- Run an automated contrast checker against the hex pairs listed in 2.7
  before/after to confirm the fix actually clears 4.5:1.
- Toggle OS-level "reduce motion" and confirm the camera/aura stop animating
  (2.6).
