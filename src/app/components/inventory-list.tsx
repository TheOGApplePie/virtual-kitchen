import React from "react";
import { Item } from "../page";
interface InventoryProps {
  inventoryList: Item[];
  location: string;
  selectInventoryItem: (item: Item) => void;
  openAddInventoryModal: () => void;
  searchInventory: (name: string) => void;
}
export default function InventoryList({
  inventoryList,
  selectInventoryItem,
  openAddInventoryModal,
  searchInventory,
  location,
}: InventoryProps) {
  const editItem = async (item: Item) => {
    selectInventoryItem(item);
  };
  const listItems = [
    ...inventoryList.map((item, i) => (
      <li className="py-2 border-y flex justify-between" key={item.name}>
        <span className="ps-3">
          {item.name} - {item.grams}g / {item.count} {item.unit}
        </span>
        <button
          className="p-2 edit-icon clickable"
          onClick={() => editItem(item)}
        >
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
      </li>
    )),
    <li key={"AddInventory"}>
      {" "}
      <button
        className="mt-1 p-3 clickable border w-full"
        onClick={openAddInventoryModal}
      >
        Add Inventory
      </button>
    </li>,
  ];
  const filterList = (event: any) => {
    const searchTerm = event.target.value;
    searchInventory(searchTerm);
  };
  return (
    <div className="border-4 w-xs">
      <div className="header flex justify-center border-b-2">
        <h1>{location} Inventory</h1>
      </div>
      <div>
        <input
          className="p-3"
          type="text"
          placeholder="Search Inventory..."
          onChange={filterList}
        />
        <hr />
        <hr />
      </div>
      <ul>{listItems}</ul>
    </div>
  );
}
