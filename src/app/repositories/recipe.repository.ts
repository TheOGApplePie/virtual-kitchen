import supabase from "../lib/supabase";
import { Recipe } from "@/types/recipe";

type RecipeRow = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  ingredients: { id: number; recipe_id: number; name: string; quantity: number; unit: string }[];
};

function toRecipe(row: RecipeRow): Recipe {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ingredients: (row.ingredients ?? []).map((i) => ({
      id: i.id,
      recipeId: i.recipe_id,
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
    })),
  };
}

export const findAllRecipes = async (): Promise<Recipe[]> => {
  const { data, error } = await supabase
    .from("recipes")
    .select("*, ingredients:recipe_ingredients(*)")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data as RecipeRow[]).map(toRecipe);
};

// A recipe with zero ingredients would otherwise vacuously match any inventory.
export const findRecipeSuggestions = async (inventory: { name: string; quantity: number }[]): Promise<Recipe[]> => {
  const recipes = await findAllRecipes();
  const inventoryMap = new Map(inventory.map((item) => [item.name.toLowerCase(), item]));
  return recipes.filter(
    (recipe) =>
      recipe.ingredients.length > 0 &&
      recipe.ingredients.every((ingredient) => {
        const inStock = inventoryMap.get(ingredient.name.toLowerCase());
        return inStock && inStock.quantity >= ingredient.quantity;
      }),
  );
};
