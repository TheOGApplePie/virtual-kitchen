import { Item } from "@/types/inventory";
import { Recipe } from "@/types/recipe";

export type ZoneId = "fridge" | "freezer" | "pantry" | "spices";

export type Zone = { id: ZoneId; name: string; emoji: string };

export const ZONES: Zone[] = [
  { id: "fridge", name: "Fridge", emoji: "🧊" },
  { id: "freezer", name: "Freezer", emoji: "❄️" },
  { id: "pantry", name: "Pantry", emoji: "🥫" },
  { id: "spices", name: "Spices", emoji: "🌶️" },
];

export const zoneIdFromLocation = (location: string): ZoneId | null => {
  const match = ZONES.find((z) => z.name.toLowerCase() === location.toLowerCase());
  return match ? match.id : null;
};

export const zoneByLocation = (location: string): Zone | undefined =>
  ZONES.find((z) => z.name.toLowerCase() === location.toLowerCase());

export type Status = "fresh" | "expiring" | "expired" | "unknown";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const daysLeftFor = (expiryDate?: string | null): number | null => {
  if (!expiryDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Parse "YYYY-MM-DD" as local-calendar components, not `new Date(string)`
  // (which parses date-only strings as UTC midnight). Mutating a UTC-parsed
  // date with setHours(0,0,0,0) — which operates in local time — silently
  // shifts the date back a day for any timezone west of UTC.
  const [year, month, day] = expiryDate.split("-").map(Number);
  const expiry = new Date(year, month - 1, day);
  expiry.setHours(0, 0, 0, 0);
  return Math.round((expiry.getTime() - today.getTime()) / MS_PER_DAY);
};

export const statusFromDaysLeft = (daysLeft: number | null): Status => {
  if (daysLeft === null) return "unknown";
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 7) return "expiring";
  return "fresh";
};

export const STATUS_COLORS: Record<Status, { color: string; bg: string; short: string }> = {
  fresh: { color: "#4ECDC4", bg: "rgba(78,205,196,0.14)", short: "Fresh" },
  expiring: { color: "#FFD93D", bg: "rgba(255,217,61,0.16)", short: "Use soon" },
  expired: { color: "#EF5350", bg: "rgba(239,83,80,0.16)", short: "Expired" },
  unknown: { color: "#4ECDC4", bg: "rgba(78,205,196,0.14)", short: "Fresh" },
};

export type DecoratedItem = Item & {
  daysLeft: number | null;
  status: Status;
  statusColor: string;
  statusBg: string;
  statusShort: string;
  qtyLabel: string;
  expiryLabel: string;
};

export const qtyLabelFor = (item: Item): string => {
  if (item.count <= 0) return "Out of stock";
  if (item.count > 1) return `${item.count} × ${item.quantity} ${item.unit}`;
  return `${item.quantity} ${item.unit}`;
};

export const expiryLabelFor = (daysLeft: number | null, expiryDate?: string | null): string => {
  if (daysLeft === null) return "No expiry set";
  if (daysLeft < 0) return `Expired ${Math.abs(daysLeft)}d ago`;
  if (daysLeft === 0) return "Expires today";
  if (daysLeft <= 14) return `Exp in ${daysLeft}d`;
  return `Exp ${expiryDate}`;
};

export const decorateItem = (item: Item): DecoratedItem => {
  const daysLeft = daysLeftFor(item.expiryDate);
  const status = statusFromDaysLeft(daysLeft);
  const { color, bg, short } = STATUS_COLORS[status];
  return {
    ...item,
    daysLeft,
    status,
    statusColor: color,
    statusBg: bg,
    statusShort: short,
    qtyLabel: qtyLabelFor(item),
    expiryLabel: expiryLabelFor(daysLeft, item.expiryDate),
  };
};

export type ZoneStatus = "expired" | "expiring" | "safe" | "empty";

export const zoneStatusFor = (items: Item[]): ZoneStatus => {
  if (items.length === 0) return "empty";
  const decorated = items.map(decorateItem);
  if (decorated.some((i) => i.status === "expired")) return "expired";
  if (decorated.some((i) => i.status === "expiring")) return "expiring";
  return "safe";
};

export const zoneStatusLabel = (status: ZoneStatus): string => {
  switch (status) {
    case "expired":
      return "something expired";
    case "expiring":
      return "use something soon";
    case "safe":
      return "all fresh";
    default:
      return "empty";
  }
};

export type ZoneGroup = { zone: Zone; items: Item[] };

// Single source of truth for "items grouped by zone, empty zones dropped" —
// used by the mobile inventory list, the show-all modal, and the desktop
// zone highlight calc, which each used to reimplement this filter/group.
export const groupByZone = (inventory: Item[]): ZoneGroup[] =>
  ZONES.map((zone) => ({
    zone,
    items: inventory.filter((it) => it.location.toLowerCase() === zone.name.toLowerCase()),
  })).filter((g) => g.items.length > 0);

export const matchInventory = (name: string, inventory: Item[]): Item | undefined =>
  inventory.find((it) => {
    const a = it.name.toLowerCase();
    const b = name.toLowerCase();
    return a === b || a.includes(b) || b.includes(a);
  });

export const matchColorFor = (pct: number): string =>
  pct >= 80 ? "#4ECDC4" : pct >= 50 ? "#FFD93D" : "#FF6B5B";

export type RecipeMatch = {
  have: { name: string; needLabel: string; haveLabel: string; zone: string }[];
  missing: { name: string; needLabel: string }[];
  total: number;
  haveCount: number;
  pct: number;
};

export const computeRecipeMatch = (recipe: Recipe, inventory: Item[]): RecipeMatch => {
  const have: RecipeMatch["have"] = [];
  const missing: RecipeMatch["missing"] = [];
  recipe.ingredients.forEach((ing) => {
    const inv = matchInventory(ing.name, inventory);
    if (inv) {
      have.push({
        name: ing.name,
        needLabel: `${ing.quantity} ${ing.unit}`,
        haveLabel: qtyLabelFor(inv),
        zone: inv.location,
      });
    } else {
      missing.push({ name: ing.name, needLabel: `${ing.quantity} ${ing.unit}` });
    }
  });
  const total = recipe.ingredients.length;
  const haveCount = have.length;
  const pct = total === 0 ? 0 : Math.round((haveCount / total) * 100);
  return { have, missing, total, haveCount, pct };
};
