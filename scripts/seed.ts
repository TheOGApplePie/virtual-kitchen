import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. " +
      "Run with: node --env-file=.env --experimental-strip-types scripts/seed.ts",
  );
  process.exit(1);
}

const supabase = createClient(url, key);

const inventoryItems = [
  { category: "Dairy", name: "Milk", quantity: 1, count: 1, unit: "L", location: "Fridge", expiry_date: "2026-06-21" },
  { category: "Produce", name: "Carrots", quantity: 4, count: 1, unit: "whole", location: "Fridge", expiry_date: "2026-06-19" },
  { category: "Grain", name: "Pasta", quantity: 500, count: 1, unit: "g", location: "Pantry", expiry_date: "2026-12-01" },
  { category: "Oil", name: "Olive Oil", quantity: 750, count: 1, unit: "ml", location: "Pantry", expiry_date: "2027-01-15" },
  { category: "Produce", name: "Basil", quantity: 1, count: 1, unit: "bunch", location: "Fridge", expiry_date: "2026-06-22" },
  { category: "Spice", name: "Cinnamon", quantity: 1, count: 1, unit: "jar", location: "Spices", expiry_date: "2026-06-11" },
  { category: "Frozen", name: "Frozen Peas", quantity: 1, count: 1, unit: "bag", location: "Freezer", expiry_date: "2027-06-15" },
  { category: "Protein", name: "Eggs", quantity: 6, count: 1, unit: "whole", location: "Fridge", expiry_date: "2026-06-28" },
  { category: "Produce", name: "Spinach", quantity: 1, count: 1, unit: "bag", location: "Fridge", expiry_date: "2026-06-18" },
  { category: "Protein", name: "Chicken Breast", quantity: 2, count: 1, unit: "lb", location: "Fridge", expiry_date: "2026-06-20" },
  { category: "Produce", name: "Garlic", quantity: 1, count: 1, unit: "bulb", location: "Pantry", expiry_date: "2026-07-16" },
  { category: "Produce", name: "Onion", quantity: 3, count: 1, unit: "whole", location: "Pantry", expiry_date: "2026-07-06" },
  { category: "Dairy", name: "Parmesan", quantity: 1, count: 1, unit: "block", location: "Fridge", expiry_date: "2026-07-26" },
  { category: "Dairy", name: "Greek Yogurt", quantity: 1, count: 1, unit: "tub", location: "Fridge", expiry_date: "2026-06-20" },
  { category: "Produce", name: "Bananas", quantity: 5, count: 1, unit: "whole", location: "Pantry", expiry_date: "2026-06-19" },
  { category: "Grain", name: "Rice", quantity: 1, count: 1, unit: "kg", location: "Pantry", expiry_date: "2027-04-01" },
  { category: "Produce", name: "Tomatoes", quantity: 4, count: 1, unit: "whole", location: "Fridge", expiry_date: "2026-06-22" },
];

const recipes = [
  { name: "Pasta Carbonara", description: "Dinner · 4 servings · 25 min", ingredients: [
    { name: "Pasta", quantity: 400, unit: "g" }, { name: "Eggs", quantity: 3, unit: "whole" },
    { name: "Bacon", quantity: 150, unit: "g" }, { name: "Parmesan", quantity: 50, unit: "g" },
    { name: "Garlic", quantity: 2, unit: "cloves" } ] },
  { name: "Chicken Stir Fry", description: "Dinner · 3 servings · 20 min", ingredients: [
    { name: "Chicken Breast", quantity: 1, unit: "lb" }, { name: "Carrots", quantity: 2, unit: "whole" },
    { name: "Onion", quantity: 1, unit: "whole" }, { name: "Garlic", quantity: 2, unit: "cloves" },
    { name: "Soy Sauce", quantity: 3, unit: "tbsp" } ] },
  { name: "Spinach Salad", description: "Lunch · 2 servings · 10 min", ingredients: [
    { name: "Spinach", quantity: 1, unit: "bag" }, { name: "Tomatoes", quantity: 2, unit: "whole" },
    { name: "Olive Oil", quantity: 2, unit: "tbsp" }, { name: "Onion", quantity: 1, unit: "whole" } ] },
  { name: "Veggie Pasta Primavera", description: "Dinner · 4 servings · 30 min", ingredients: [
    { name: "Pasta", quantity: 400, unit: "g" }, { name: "Carrots", quantity: 2, unit: "whole" },
    { name: "Spinach", quantity: 1, unit: "bag" }, { name: "Olive Oil", quantity: 3, unit: "tbsp" },
    { name: "Parmesan", quantity: 40, unit: "g" } ] },
  { name: "Fluffy Pancakes", description: "Breakfast · 4 servings · 20 min", ingredients: [
    { name: "Flour", quantity: 200, unit: "g" }, { name: "Eggs", quantity: 2, unit: "whole" },
    { name: "Milk", quantity: 300, unit: "ml" }, { name: "Cinnamon", quantity: 1, unit: "tsp" } ] },
  { name: "Egg Fried Rice", description: "Dinner · 3 servings · 15 min", ingredients: [
    { name: "Rice", quantity: 300, unit: "g" }, { name: "Eggs", quantity: 2, unit: "whole" },
    { name: "Carrots", quantity: 1, unit: "whole" }, { name: "Onion", quantity: 1, unit: "whole" },
    { name: "Frozen Peas", quantity: 1, unit: "cup" } ] },
  { name: "Tomato Bruschetta", description: "Lunch · 4 servings · 15 min", ingredients: [
    { name: "Tomatoes", quantity: 3, unit: "whole" }, { name: "Basil", quantity: 1, unit: "bunch" },
    { name: "Olive Oil", quantity: 2, unit: "tbsp" }, { name: "Garlic", quantity: 1, unit: "clove" } ] },
];

async function main() {
  const { error: invError } = await supabase.from("inventory_items").insert(inventoryItems);
  if (invError) throw invError;
  console.log(`Seeded ${inventoryItems.length} inventory items.`);

  for (const recipe of recipes) {
    const { data: created, error: recipeError } = await supabase
      .from("recipes")
      .insert({ name: recipe.name, description: recipe.description })
      .select()
      .single();
    if (recipeError) throw recipeError;

    const { error: ingredientError } = await supabase.from("recipe_ingredients").insert(
      recipe.ingredients.map((ing) => ({ ...ing, recipe_id: created.id })),
    );
    if (ingredientError) throw ingredientError;
  }
  console.log(`Seeded ${recipes.length} recipes.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
