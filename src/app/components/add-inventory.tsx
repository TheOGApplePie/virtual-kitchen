"use client";
import React, { useState } from "react";
import { Item } from "../../types/inventory";
import { addItem, updateItem, deleteItem } from "@/app/actions/inventory.actions";
import "./home/home.css";

export type AddInventoryCloseResult =
  | { type: "saved"; item: Item }
  | { type: "deleted"; id: number }
  | undefined;

interface AddInventoryProps {
  location: string;
  selectedInventoryItem: Item;
  closeAddInventoryModalAction: (result?: AddInventoryCloseResult) => void;
}

export default function AddInventory({
  location,
  closeAddInventoryModalAction,
  selectedInventoryItem,
}: AddInventoryProps) {
  const isEditing = !!selectedInventoryItem.id;

  const [formData, setFormData] = useState({
    id: selectedInventoryItem.id ?? undefined,
    category: selectedInventoryItem.category ?? "",
    name: selectedInventoryItem.name ?? "",
    quantity: selectedInventoryItem.quantity ?? 0,
    count: selectedInventoryItem.count ?? 0,
    unit: selectedInventoryItem.unit ?? "",
    location: selectedInventoryItem.location || location,
    expiryDate: selectedInventoryItem.expiryDate
      ? String(selectedInventoryItem.expiryDate).slice(0, 10)
      : "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = event.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "number" ? Number(value) : value,
    }));
  };

  const handleFormSubmission = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    const payload = { ...formData, expiryDate: formData.expiryDate || null };
    const result = formData.id
      ? await updateItem({ ...payload, id: formData.id })
      : await addItem(payload);
    setIsSubmitting(false);
    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }
    closeAddInventoryModalAction({ type: "saved", item: result.data });
  };

  const handleDeletion = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    const id = selectedInventoryItem.id as number;
    const result = await deleteItem(id);
    setIsSubmitting(false);
    if (!result.ok) {
      setSubmitError(result.error);
      setConfirmingDelete(false);
      return;
    }
    closeAddInventoryModalAction({ type: "deleted", id });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="p-6 rounded shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h1 className="text-xl font-semibold">
            {isEditing ? "Edit Item" : "Add Inventory"}
          </h1>
          <button
            onClick={() => closeAddInventoryModalAction()}
            className="text-red-600 text-xl font-bold clickable"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleFormSubmission}>
          <span>Category</span>
          <input
            type="text"
            id="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g. Dairy"
            className="border px-3 py-2 rounded"
            disabled={isSubmitting}
          />
          <span>Name</span>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Milk"
            className="border px-3 py-2 rounded"
            disabled={isSubmitting}
          />
          <span>Quantity</span>
          <input
            type="number"
            id="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="e.g. 500"
            min={0}
            step="any"
            className="border px-3 py-2 rounded"
            disabled={isSubmitting}
          />
          <span>Unit (e.g. g, ml, bag)</span>
          <input
            type="text"
            id="unit"
            value={formData.unit}
            onChange={handleChange}
            placeholder="e.g. g"
            className="border px-3 py-2 rounded"
            disabled={isSubmitting}
          />
          <span>Count (how many of this unit)</span>
          <input
            type="number"
            id="count"
            value={formData.count}
            onChange={handleChange}
            placeholder="e.g. 2"
            min={0}
            className="border px-3 py-2 rounded"
            disabled={isSubmitting}
          />
          <span>Expiry date (optional)</span>
          <input
            type="date"
            id="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            className="border px-3 py-2 rounded"
            disabled={isSubmitting}
          />
          <div className="border px-3 py-2 rounded text-gray-500 text-sm">
            Location: {formData.location}
          </div>

          {submitError && (
            <p className="text-red-500 text-sm">{submitError}</p>
          )}

          {confirmingDelete ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-red-400">
                Are you sure you want to delete this item?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-800 clickable disabled:opacity-50"
                  onClick={handleDeletion}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Deleting…" : "Yes, delete"}
                </button>
                <button
                  type="button"
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-800 clickable"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-between gap-2">
              {isEditing && (
                <button
                  type="button"
                  className="w-1/3 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700 clickable disabled:opacity-50"
                  onClick={() => setConfirmingDelete(true)}
                  disabled={isSubmitting}
                >
                  Delete
                </button>
              )}
              <button
                type="submit"
                className={`${isEditing ? "w-1/3" : "w-full"} bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 clickable disabled:opacity-50`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving…" : "Submit"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
