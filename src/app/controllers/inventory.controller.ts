import { inventoryService } from "../services/inventory.service";
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
      return await inventoryService.createNewInventory(newItem);
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
      return await inventoryService.updateExistingInventory(newItem);
    } catch (error) {
      throw error;
    }
  }
  async getAllInventoryItems() {
    try {
      return await inventoryService.findAllInventoryItems();
    } catch (error) {
      throw error;
    }
  }
}
export const inventory = new Inventory();
