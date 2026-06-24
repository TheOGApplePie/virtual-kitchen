"use client";
import { useState } from "react";
import { Item } from "@/types/inventory";

type Props = {
  title: string;
  items: Item[];
  onClose: () => void;
  onConfirm: (updates: { item: Item; use: number }[]) => void;
};

export default function ConsumeModal({ title, items, onClose, onConfirm }: Props) {
  const [useAmounts, setUseAmounts] = useState<Record<number, number>>(
    Object.fromEntries(items.map((it) => [it.id as number, it.count])),
  );

  const inc = (id: number, max: number) =>
    setUseAmounts((s) => ({ ...s, [id]: Math.min(max, (s[id] ?? 0) + 1) }));
  const dec = (id: number) =>
    setUseAmounts((s) => ({ ...s, [id]: Math.max(0, (s[id] ?? 0) - 1) }));

  const handleConfirm = () => {
    onConfirm(items.map((item) => ({ item, use: useAmounts[item.id as number] ?? 0 })));
  };

  return (
    <>
      <div className="detail-backdrop" style={{ zIndex: 300 }} onClick={onClose} />
      <div className="sheet">
        <div className="modal-header">
          <h2 style={{ margin: 0, fontSize: "20px" }}>{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p style={{ fontSize: "13px", color: "#A0A5B0", margin: "0 0 8px" }}>
          Confirm how much you used — we&apos;ll subtract it from your inventory.
        </p>
        <div>
          {items.map((item) => (
            <div className="consume-row" key={item.id}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: "14px" }}>{item.name}</div>
                <div style={{ fontSize: "12px", color: "#A0A5B0" }}>
                  Have {item.count} {item.unit} in {item.location}
                </div>
              </div>
              <div className="qty-stepper">
                <button className="qty-btn" onClick={() => dec(item.id as number)}>−</button>
                <span style={{ minWidth: "54px", textAlign: "center", fontSize: "13px" }}>
                  {useAmounts[item.id as number] ?? 0} {item.unit}
                </span>
                <button className="qty-btn" onClick={() => inc(item.id as number, item.count)}>+</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleConfirm}>
            Deduct from inventory
          </button>
        </div>
      </div>
    </>
  );
}
