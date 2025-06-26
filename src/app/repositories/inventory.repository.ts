import prisma from "../lib/prisma";
import { Item } from "../page";

export const findAllItems = async () => {
  return await prisma.inventoryItem.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

export const createInventory = async (newItem: Item) => {
  return await prisma.inventoryItem.create({
    data: {
      ...newItem,
      count: parseInt(newItem.count.toString()),
      grams: parseFloat(newItem.grams.toString()),
    },
  });
};
export const updateInventory = async (newItem: Item) => {
  return await prisma.inventoryItem.update({
    where: {
      id: newItem.id,
    },
    data: {
      ...newItem,
      count: parseInt(newItem.count.toString()),
      grams: parseFloat(newItem.grams.toString()),
    },
  });
};
