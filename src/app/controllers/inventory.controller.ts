import {
  createInventory,
  findAllItems,
  updateInventory,
} from "../repositories/inventory.repository";

class Inventory {
  async createInventoryItem(newItem: {
    category: string;
    name: string;
    grams: number;
    count: number;
    unit: string;
    location: string;
  }) {
    try {
      return await createInventory(newItem);
    } catch (error) {
      throw error;
    }
  }
  async updateInventoryItem(newItem: {
    id: number;
    category: string;
    name: string;
    grams: number;
    count: number;
    location: string;
    unit: string;
  }) {
    try {
      return await updateInventory(newItem);
    } catch (error) {
      throw error;
    }
  }

  async getAllInventoryItems() {
    try {
      return await findAllItems();
    } catch (error) {
      throw error;
    }
  }
}
export const inventory = new Inventory();
