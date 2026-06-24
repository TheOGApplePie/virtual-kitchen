"use client";
import { zoneIdFromLocation, DecoratedItem } from "@/app/lib/inventory-helpers";

type Props = {
  value: string;
  onChange: (v: string) => void;
  inventory: DecoratedItem[];
  onPick: (zoneId: string, itemId: number) => void;
};

export default function SearchBar({ value, onChange, inventory, onPick }: Props) {
  const term = value.trim().toLowerCase();
  const results = term
    ? inventory
        .filter((it) => it.name.toLowerCase().includes(term))
        .slice(0, 7)
        .map((it) => ({ item: it, decorated: it, zoneId: zoneIdFromLocation(it.location) }))
        .filter((r) => r.zoneId)
    : [];

  return (
    <div className="kitchen-search-wrap">
      <div className="kitchen-search-box">
        <span style={{ color: "#6E7A8C", fontSize: "17px" }}>⌕</span>
        <input
          type="text"
          placeholder="Search your kitchen…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value.length > 0 && (
          <span style={{ cursor: "pointer", color: "#6E7A8C" }} onClick={() => onChange("")}>
            ✕
          </span>
        )}
      </div>
      {term.length > 0 && (
        <div className="search-results">
          {results.map(({ item, decorated, zoneId }) => (
            <div
              key={item.id}
              className="search-result"
              onClick={() => onPick(zoneId as string, item.id as number)}
            >
              <span className="search-dot" style={{ background: decorated.statusColor }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>{item.name}</div>
                <div style={{ fontSize: "12px", color: "#A0A5B0" }}>
                  {item.location} • {decorated.qtyLabel}
                </div>
              </div>
              <div style={{ fontSize: "11px", color: decorated.statusColor, flexShrink: 0 }}>
                {decorated.expiryLabel}
              </div>
            </div>
          ))}
          {results.length === 0 && (
            <div style={{ padding: "16px", color: "#A0A5B0", fontSize: "13px", textAlign: "center" }}>
              Nothing in your kitchen matches that.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
