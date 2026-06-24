import { NextResponse } from "next/server";
import supabase from "@/app/lib/supabase";
import { findRecipeSuggestions } from "@/app/repositories/recipe.repository";

export async function GET() {
  try {
    const { data: inventory, error } = await supabase.from("inventory_items").select("name, quantity");
    if (error) throw error;

    const suggestions = await findRecipeSuggestions(inventory ?? []);
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("GET /api/recipes/suggestions:", error);
    return NextResponse.json({ error: "Failed to fetch recipe suggestions" }, { status: 500 });
  }
}
