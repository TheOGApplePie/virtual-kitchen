import HomePage from "./components/home/home";
import React from "react";
import { findAllItems } from "./repositories/inventory.repository";
export interface Item {
  id?: number;
  category: string;
  location: string;
  name: string;
  grams: number;
  count: number;
  unit: string;
}

export default async function App() {
  const inventoryList = await findAllItems();
  return (
    <div style={{ width: "90dvw", height: "90dvh" }}>
      <HomePage inventoryList={inventoryList} />
    </div>
  );
}
