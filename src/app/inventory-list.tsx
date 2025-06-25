import React from "react";
import { Item } from "./page";
interface InventoryProps {
  inventoryList: Item[];
  selectInventoryItem: (item: Item) => void;
  openAddInventoryModal: () => void;
}
export default function InventoryList({
  inventoryList,
  selectInventoryItem,
  openAddInventoryModal,
}: InventoryProps) {
  const editItem = async (item) => {
    selectInventoryItem(item);
  };
  const listItems = [
    ...inventoryList.map((item, i) => (
      <li className="pt-3" key={item.name}>
        <span className="flex">
          {item.name} - {item.grams}g / {item.count} {item.unit}
          <button className="p-2" onClick={() => editItem(item)}>
            <i>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                />
              </svg>
            </i>
          </button>
        </span>

        <hr />
      </li>
    )),
    <li key={"AddInventory"}>
      {" "}
      <button onClick={openAddInventoryModal}>Add Inventory</button>
    </li>,
  ];
  return (
    <div className="m-4 border-4 p-4 ">
      <div className="header flex justify-center border-b-2">
        <h1>Inventory</h1>
      </div>
      <div>
        <input type="text" placeholder="Search Inventory..." />
        <hr />
        <hr />
      </div>
      <ul>{listItems}</ul>
    </div>
  );
}
