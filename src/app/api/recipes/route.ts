import { NextResponse } from "next/server";
import { findAllRecipes } from "@/app/repositories/recipe.repository";

export async function GET() {
  try {
    const recipes = await findAllRecipes();
    return NextResponse.json(recipes);
  } catch (error) {
    console.error("GET /api/recipes:", error);
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
}
