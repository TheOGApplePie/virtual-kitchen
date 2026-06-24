import HomePage from "./components/home/home";
import { findAllItems } from "./repositories/inventory.repository";
import { findAllRecipes } from "./repositories/recipe.repository";
import { Item } from "@/types/inventory";
import { Recipe } from "@/types/recipe";

// Inventory/recipes change via server actions on every consume/add/edit —
// always fetch fresh on request rather than serving a build-time snapshot.
export const dynamic = "force-dynamic";

export default async function App() {
  let initialInventory: Item[] = [];
  let initialRecipes: Recipe[] = [];
  let initialError: string | null = null;

  try {
    [initialInventory, initialRecipes] = await Promise.all([findAllItems(), findAllRecipes()]);
  } catch (error) {
    console.error("Initial data load failed:", error);
    initialError = "Could not load your kitchen. Check your connection and try again.";
  }

  return (
    <div style={{ width: "100dvw", height: "100dvh" }}>
      <HomePage
        initialInventory={initialInventory}
        initialRecipes={initialRecipes}
        initialError={initialError}
      />
    </div>
  );
}
