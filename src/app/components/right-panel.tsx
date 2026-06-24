"use client";
import {
  matchColorFor,
  computeRecipeMatch,
  zoneStatusFor,
  zoneStatusLabel,
  Zone,
  DecoratedItem,
} from "@/app/lib/inventory-helpers";
import { Item } from "@/types/inventory";
import { Recipe } from "@/types/recipe";

type Props = {
  zone: Zone;
  zoneItems: DecoratedItem[];
  focusedItem: DecoratedItem | null;
  recipes: Recipe[];
  inventory: Item[];
  onClose: () => void;
  onSelectItem: (itemId: number) => void;
  onBackToZone: () => void;
  onShowAll: () => void;
  onConsume: (item: Item) => void;
  onRemove: (itemId: number) => void;
  onEdit: (item: Item) => void;
};

export default function RightPanel({
  zone,
  zoneItems,
  focusedItem,
  recipes,
  inventory,
  onClose,
  onSelectItem,
  onBackToZone,
  onShowAll,
  onConsume,
  onRemove,
  onEdit,
}: Props) {
  const zoneStatus = zoneStatusFor(zoneItems);

  if (focusedItem) {
    const d = focusedItem;
    const nameL = focusedItem.name.toLowerCase();
    const mealIdeas = recipes
      .filter((r) => r.ingredients.some((ing) => {
        const a = ing.name.toLowerCase();
        return a.includes(nameL) || nameL.includes(a);
      }))
      .map((r) => {
        const m = computeRecipeMatch(r, inventory);
        return { recipe: r, match: m };
      })
      .sort((a, b) => b.match.pct - a.match.pct)
      .slice(0, 5);

    return (
      <div className="right-panel">
        <div className="rp-header">
          <button className="btn btn-secondary btn-sm" style={{ marginBottom: "14px" }} onClick={onBackToZone}>
            ← {zone.name}
          </button>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 600 }}>{focusedItem.name}</div>
              <div style={{ fontSize: "13px", color: "#A0A5B0", marginTop: "4px" }}>{focusedItem.location}</div>
            </div>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="rp-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
            <div className="stat-cell">
              <div className="stat-label">Quantity</div>
              <div className="stat-value">{d.qtyLabel}</div>
            </div>
            <div className="stat-cell">
              <div className="stat-label">Best by</div>
              <div className="stat-value" style={{ color: d.statusColor }}>
                {focusedItem.expiryDate ?? "—"}
              </div>
            </div>
          </div>
          <div className="status-pill" style={{ background: d.statusBg, color: d.statusColor }}>
            {d.statusShort}
          </div>

          <h3 style={{ margin: "24px 0 4px" }}>Meal ideas</h3>
          <p style={{ fontSize: "12px", color: "#A0A5B0", margin: "0 0 14px" }}>
            Recipes using {focusedItem.name}, ranked by what else you have.
          </p>
          {mealIdeas.map(({ recipe, match }) => (
            <div className="recipe-card" key={recipe.id} style={{ marginBottom: "10px" }}>
              <div className="recipe-info" style={{ padding: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                  <div style={{ fontWeight: 500, fontSize: "14px" }}>{recipe.name}</div>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: matchColorFor(match.pct) }}>
                    {match.pct}%
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#A0A5B0", marginTop: "3px" }}>
                  {match.haveCount}/{match.total} ingredients
                </div>
                <div className="match-bar">
                  <div
                    className="match-fill"
                    style={{ width: `${match.pct}%`, background: matchColorFor(match.pct) }}
                  />
                </div>
              </div>
            </div>
          ))}
          {mealIdeas.length === 0 && (
            <div style={{ fontSize: "13px", color: "#A0A5B0", padding: "8px 0" }}>
              No recipes use this item yet.
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onConsume(focusedItem)}>
              Use / deduct
            </button>
            <button
              className="btn btn-secondary"
              title="Edit"
              style={{ flex: "0 0 auto" }}
              onClick={() => onEdit(focusedItem)}
            >
              ✎
            </button>
            <button
              className="btn btn-secondary"
              title="Remove"
              style={{ flex: "0 0 auto" }}
              onClick={() => onRemove(focusedItem.id as number)}
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="right-panel">
      <div className="rp-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "22px", fontWeight: 600 }}>
              {zone.emoji} {zone.name}
            </div>
            <div style={{ fontSize: "13px", color: "#A0A5B0", marginTop: "4px" }}>
              {zoneItems.length} items · {zoneStatusLabel(zoneStatus)}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
      </div>
      <div className="rp-body">
        {zoneItems.map((item) => {
          const d = item;
          return (
            <div
              key={item.id}
              className="inventory-item"
              style={{ borderLeftColor: d.statusColor, cursor: "pointer" }}
              onClick={() => onSelectItem(item.id as number)}
            >
              <div className="item-info">
                <div className="item-name">{item.name}</div>
                <div className="item-meta">
                  {d.qtyLabel} • {d.expiryLabel}
                </div>
              </div>
              <span style={{ color: "#5A6B82", fontSize: "18px" }}>›</span>
            </div>
          );
        })}
        {zoneItems.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 16px", color: "#A0A5B0" }}>
            <div style={{ fontSize: "30px", marginBottom: "10px" }}>🗑️</div>
            <div style={{ fontSize: "13px" }}>This zone is empty.</div>
          </div>
        )}
        <button className="btn btn-secondary" style={{ width: "100%", marginTop: "14px" }} onClick={onShowAll}>
          Show all kitchen items
        </button>
      </div>
    </div>
  );
}
