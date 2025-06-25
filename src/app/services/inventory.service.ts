import { Item } from "../page";
import {
  createInventory,
  findAllItems,
  updateInventory,
} from "../repositories/inventory.repository";

class InventoryService {
  async findAllInventoryItems() {
    return await findAllItems();
  }

  async createNewInventory(newItem: Item) {
    return await createInventory(newItem);
  }
  async updateExistingInventory(newItem: Item) {
    return await updateInventory(newItem);
  }
}
export const inventoryService = new InventoryService();
