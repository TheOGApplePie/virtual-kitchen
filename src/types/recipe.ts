export interface RecipeIngredient {
  id: number;
  recipeId: number;
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: number;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  ingredients: RecipeIngredient[];
}
