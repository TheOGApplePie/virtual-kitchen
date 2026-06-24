"use server";

import { revalidatePath } from "next/cache";
import {
  createInventory,
  updateInventory,
  deleteInventory,
  findItemById,
  NotFoundError,
} from "@/app/repositories/inventory.repository";
import { createItemSchema, updateItemSchema, CreateItemInput, UpdateItemInput, Item } from "@/types/inventory";

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

const toMessage = (error: unknown, fallback: string) =>
  error instanceof NotFoundError ? error.message : fallback;

export async function addItem(input: CreateItemInput): Promise<ActionResult<Item>> {
  const parsed = createItemSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid item" };
  }
  try {
    const item = await createInventory(parsed.data);
    revalidatePath("/");
    return { ok: true, data: item };
  } catch (error) {
    console.error("addItem:", error);
    return { ok: false, error: toMessage(error, "Failed to add item") };
  }
}

export async function updateItem(input: UpdateItemInput): Promise<ActionResult<Item>> {
  const parsed = updateItemSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid item" };
  }
  try {
    const item = await updateInventory(parsed.data);
    revalidatePath("/");
    return { ok: true, data: item };
  } catch (error) {
    console.error("updateItem:", error);
    return { ok: false, error: toMessage(error, "Failed to update item") };
  }
}

export async function deleteItem(id: number): Promise<ActionResult<Item>> {
  try {
    const item = await deleteInventory(id);
    revalidatePath("/");
    return { ok: true, data: item };
  } catch (error) {
    console.error("deleteItem:", error);
    return { ok: false, error: toMessage(error, "Failed to delete item") };
  }
}

export type ConsumeUpdate = { id: number; use: number };
export type ConsumeResult = { updated: Item[]; deletedIds: number[] };

// Centralizes the "decrement count, delete once it hits zero" rule in one
// place, re-reading each item's current count server-side so a stale client
// copy of `count` can't produce a wrong decrement. Callers patch their local
// list using `updated`/`deletedIds` rather than re-fetching everything.
export async function consumeItems(updates: ConsumeUpdate[]): Promise<ActionResult<ConsumeResult>> {
  try {
    const result: ConsumeResult = { updated: [], deletedIds: [] };
    for (const { id, use } of updates) {
      if (use <= 0) continue;
      const current = await findItemById(id);
      const newCount = current.count - use;
      if (newCount <= 0) {
        await deleteInventory(id);
        result.deletedIds.push(id);
      } else {
        result.updated.push(await updateInventory({ ...current, count: newCount }));
      }
    }
    revalidatePath("/");
    return { ok: true, data: result };
  } catch (error) {
    console.error("consumeItems:", error);
    return { ok: false, error: toMessage(error, "Failed to update inventory") };
  }
}
