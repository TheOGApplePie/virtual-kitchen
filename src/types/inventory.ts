import { z } from "zod";

export interface Item {
  id?: number;
  category: string;
  location: string;
  name: string;
  quantity: number;
  count: number;
  unit: string;
  expiryDate?: string | null;
}

export const createItemSchema = z.object({
  category: z.string().min(1, "Category is required"),
  location: z.string().min(1, "Location is required"),
  name: z.string().min(1, "Name is required"),
  quantity: z.number().nonnegative("Quantity must be 0 or greater"),
  count: z.number().int().nonnegative("Count must be 0 or greater"),
  unit: z.string().min(1, "Unit is required"),
  expiryDate: z.string().nullable().optional(),
});

export const updateItemSchema = createItemSchema.extend({
  id: z.number().int().positive("ID must be a positive integer"),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
