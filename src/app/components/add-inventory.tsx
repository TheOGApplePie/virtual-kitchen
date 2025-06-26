"use client";
import React, { useState } from "react";
import { Item } from "../page";
import "./home/home.css";
interface AddInventoryProps {
  openAddInventoryModal: boolean;
  location: string;
  selectedInventoryItem: Item;
  closeAddInventoryModalAction: (fetchData?: boolean) => void;
}
export default function AddInventory({
  openAddInventoryModal,
  location,
  closeAddInventoryModalAction,
  selectedInventoryItem,
}: AddInventoryProps) {
  if (!openAddInventoryModal) return null;
  const showDelete = !!selectedInventoryItem.id;
  const [formData, setFormData] = useState({
    id: selectedInventoryItem.id ?? undefined,
    category: selectedInventoryItem.category ?? "",
    name: selectedInventoryItem.name ?? "",
    grams: selectedInventoryItem.grams ?? 0.0,
    count: selectedInventoryItem.count ?? 0,
    unit: selectedInventoryItem.unit ?? "",
    location: selectedInventoryItem.location
      ? selectedInventoryItem.location
      : location,
  });

  const handleFormSubmission = async (event: React.FormEvent) => {
    event.preventDefault();
    await fetch("/api/inventory", {
      method: formData.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then(() => {
        closeAddInventoryModalAction(true);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleDeletion = async (event: React.FormEvent) => {
    event.preventDefault();
    await fetch(`/api/inventory/${selectedInventoryItem.id}`, {
      method: "DELETE",
    })
      .then(() => {
        closeAddInventoryModalAction(true);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleChange = (event: any) => {
    const { id, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
  };
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="p-6 rounded shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h1 className="text-xl font-semibold">Add Inventory</h1>
          <button
            onClick={() => {
              closeAddInventoryModalAction();
            }}
            className="text-red-600 text-xl font-bold clickable"
          >
            ×
          </button>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleFormSubmission}>
          <span>Enter a category</span>
          <input
            type="text"
            id="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Category"
            className="border px-3 py-2 rounded"
          />
          <span>Enter a name</span>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            className="border px-3 py-2 rounded"
          />
          <span>Enter the amount of the food in grams</span>
          <input
            type="number"
            id="grams"
            value={formData.grams}
            onChange={handleChange}
            placeholder="Quantity in grams"
            className="border px-3 py-2 rounded"
          />
          <span>How would you group this food? (Ex bag(s))</span>
          <input
            type="text"
            id="unit"
            value={formData.unit}
            onChange={handleChange}
            placeholder="Units"
            className="border px-3 py-2 rounded"
          />
          <span>How many groups do you have? (ex 2 bags)</span>
          <input
            type="number"
            id="count"
            value={formData.count}
            onChange={handleChange}
            placeholder="Count"
            className="border px-3 py-2 rounded"
          />
          <input
            type="text"
            id="location"
            value={formData.location}
            disabled
            className="border px-3 py-2 rounded"
          />
          <div className="w-full flex justify-between">
            {showDelete ? (
              <button
                className="w-1/3 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700 clickable"
                onClick={handleDeletion}
              >
                Delete
              </button>
            ) : (
              <></>
            )}
            <button
              type="submit"
              className={`${showDelete ? "w-1/3" : "w-full"} bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 clickable`}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
