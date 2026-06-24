import supabase from "../lib/supabase";
import { CreateItemInput, UpdateItemInput } from "../../types/inventory";

type InventoryRow = {
  id: number;
  category: string;
  name: string;
  quantity: number;
  count: number;
  unit: string;
  location: string;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
};

function toItem(row: InventoryRow) {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    quantity: row.quantity,
    count: row.count,
    unit: row.unit,
    location: row.location,
    expiryDate: row.expiry_date ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class NotFoundError extends Error {}

// PostgREST returns this code from .single() when the row doesn't exist —
// distinguish "already gone" from a genuine server/connection failure.
const isNotFoundError = (error: { code?: string }) => error.code === "PGRST116";

export const findAllItems = async () => {
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data as InventoryRow[]).map(toItem);
};

export const findItemById = async (id: number) => {
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    if (isNotFoundError(error)) throw new NotFoundError(`Item ${id} not found`);
    throw error;
  }
  return toItem(data as InventoryRow);
};

export const createInventory = async (newItem: CreateItemInput) => {
  const { data, error } = await supabase
    .from("inventory_items")
    .insert({
      category: newItem.category,
      name: newItem.name,
      quantity: newItem.quantity,
      count: newItem.count,
      unit: newItem.unit,
      location: newItem.location,
      expiry_date: newItem.expiryDate ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return toItem(data as InventoryRow);
};

export const updateInventory = async (newItem: UpdateItemInput) => {
  const { data, error } = await supabase
    .from("inventory_items")
    .update({
      category: newItem.category,
      name: newItem.name,
      quantity: newItem.quantity,
      count: newItem.count,
      unit: newItem.unit,
      location: newItem.location,
      expiry_date: newItem.expiryDate ?? null,
    })
    .eq("id", newItem.id)
    .select()
    .single();
  if (error) {
    if (isNotFoundError(error)) throw new NotFoundError(`Item ${newItem.id} not found`);
    throw error;
  }
  return toItem(data as InventoryRow);
};

export const deleteInventory = async (id: number) => {
  const { data, error } = await supabase
    .from("inventory_items")
    .delete()
    .eq("id", id)
    .select()
    .single();
  if (error) {
    if (isNotFoundError(error)) throw new NotFoundError(`Item ${id} not found`);
    throw error;
  }
  return toItem(data as InventoryRow);
};
