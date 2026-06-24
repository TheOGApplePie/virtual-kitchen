"use client";
import { groupByZone, DecoratedItem } from "@/app/lib/inventory-helpers";

type Props = {
  inventory: DecoratedItem[];
  onClose: () => void;
  onPick: (zoneId: string, itemId: number) => void;
};

export default function ShowAllModal({ inventory, onClose, onPick }: Props) {
  const groups = groupByZone(inventory);

  return (
    <>
      <div className="detail-backdrop" style={{ zIndex: 300 }} onClick={onClose} />
      <div className="sheet" style={{ maxWidth: "560px" }}>
        <div className="modal-header">
          <h2 style={{ margin: 0, fontSize: "20px" }}>All kitchen items</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
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
              return (
                <div
                  key={item.id}
                  className="inventory-item"
                  style={{ borderLeftColor: d.statusColor, cursor: "pointer" }}
                  onClick={() => onPick(zone.id, item.id as number)}
                >
                  <div className="item-info">
                    <div className="item-name">{item.name}</div>
                    <div className="item-meta">
                      {d.qtyLabel} • {d.expiryLabel}
                    </div>
                  </div>
                  <span className="status-pill" style={{ background: d.statusBg, color: d.statusColor }}>
                    {d.statusShort}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}
