import React, { useState } from "react";
import { Item } from "./page";
interface AddInventoryProps {
  openAddInventoryModal: boolean;
  location: string;
  selectedInventoryItem: Item;
  closeAddInventoryModal: () => void;
  sendDataToHome: (formData: {
    category: string;
    name: string;
    quantityInGrams: number;
    location: string;
    count: number;
    units: string;
  }) => void;
}
export default function AddInventory({
  openAddInventoryModal,
  location,
  closeAddInventoryModal,
  selectedInventoryItem,
  sendDataToHome,
}: AddInventoryProps) {
  if (!openAddInventoryModal) return null;
  const [formData, setFormData] = useState({
    id: selectedInventoryItem.id ?? undefined,
    category: selectedInventoryItem.category ?? "",
    name: selectedInventoryItem.name ?? "",
    quantityInGrams: selectedInventoryItem.grams ?? 0.0,
    count: selectedInventoryItem.count ?? 0,
    units: selectedInventoryItem.unit ?? "",
    location: selectedInventoryItem.location ?? location,
  });

  const handleFormSubmission = (event: React.FormEvent) => {
    event.preventDefault();
    sendDataToHome(formData);
    closeAddInventoryModal();
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
            onClick={closeAddInventoryModal}
            className="text-red-600 text-xl font-bold"
          >
            ×
          </button>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleFormSubmission}>
          <input
            type="text"
            id="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Category"
            className="border px-3 py-2 rounded"
          />
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            className="border px-3 py-2 rounded"
          />
          <input
            type="number"
            id="quantityInGrams"
            value={formData.quantityInGrams}
            onChange={handleChange}
            placeholder="Quantity in grams"
            className="border px-3 py-2 rounded"
          />
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
            id="units"
            value={formData.units}
            onChange={handleChange}
            placeholder="Units"
            className="border px-3 py-2 rounded"
          />
          <input
            type="text"
            id="location"
            value={formData.location}
            disabled
            className="border px-3 py-2 rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
