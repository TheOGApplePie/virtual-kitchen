"use client";
import { useState } from "react";
import { groupByZone, DecoratedItem } from "@/app/lib/inventory-helpers";
import { Item } from "@/types/inventory";

type Props = {
  inventory: DecoratedItem[];
  onConsumeOne: (item: Item) => void;
  onConsumeMany: (items: Item[]) => void;
  onEdit: (item: Item) => void;
};

export default function MobileInventory({ inventory, onConsumeOne, onConsumeMany, onEdit }: Props) {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [swipedId, setSwipedId] = useState<number | null>(null);

  const groups = groupByZone(inventory);

  const toggleSelect = (id: number) => {
    setSelectedIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const rowTap = (item: Item) => {
    const id = item.id as number;
    if (selectMode) {
      toggleSelect(id);
    } else {
      setSwipedId((cur) => (cur === id ? null : id));
    }
  };

  const selectedItems = inventory.filter((it) => selectedIds.includes(it.id as number));

  return (
    <div className="screen active" data-screen="inventory">
      <div className="section-header">
        <h1 style={{ marginBottom: 0 }}>Inventory</h1>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => {
            setSelectMode((v) => !v);
            setSelectedIds([]);
            setSwipedId(null);
          }}
        >
          {selectMode ? "Done" : "Select"}
        </button>
      </div>
      <p style={{ fontSize: "13px", color: "#A0A5B0", margin: "0 0 8px" }}>
        {selectMode
          ? "Tap items to select, then use them together."
          : "Tap an item to use it, or tap Select for multiple."}
      </p>

      {groups.map(({ zone, items }) => (
        <div key={zone.id}>
          <div className="inv-group-header">
            <span>
              {zone.emoji} {zone.name}
            </span>
            <span style={{ color: "#6E7A8C", fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>
              {items.length}
            </span>
          </div>
          {items.map((item) => {
            const d = item as DecoratedItem;
            const id = item.id as number;
            const checked = selectedIds.includes(id);
            const swiped = swipedId === id;
            return (
              <div className="swipe-wrap" key={id}>
                <button className="swipe-use" onClick={() => onConsumeOne(item)}>
                  Use
                </button>
                <div
                  className="swipe-row"
                  style={{
                    borderLeftColor: d.statusColor,
                    transform: swiped ? "translateX(-80px)" : "translateX(0)",
                  }}
                  onClick={() => rowTap(item)}
                >
                  {selectMode && (
                    <div className={`inv-check ${checked ? "checked" : ""}`}>{checked ? "✓" : ""}</div>
                  )}
                  <div className="item-info">
                    <div className="item-name">{item.name}</div>
                    <div className="item-meta">
                      {d.qtyLabel} • {d.expiryLabel}
                    </div>
                  </div>
                  <span className="status-pill" style={{ background: d.statusBg, color: d.statusColor }}>
                    {d.statusShort}
                  </span>
                  <button
                    className="action-btn"
                    aria-label={`Edit ${item.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(item);
                    }}
                  >
                    ✎
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {inventory.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 16px", color: "#A0A5B0" }}>
          <div style={{ fontSize: "34px", marginBottom: "12px" }}>🗑️</div>
          <div>Your inventory is empty.</div>
        </div>
      )}

      <div style={{ height: "90px" }} />

      {selectMode && selectedIds.length > 0 && (
        <div className="select-bar">
          <span style={{ fontSize: "13px", color: "#A0A5B0", flex: 1 }}>{selectedIds.length} selected</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setSelectedIds([])}>
            Clear
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onConsumeMany(selectedItems)}>
            Use selected
          </button>
        </div>
      )}
    </div>
  );
}
