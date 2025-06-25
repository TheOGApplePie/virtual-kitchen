import prisma from "../lib/prisma";

export const findAllItems = async () => {
  return await prisma.inventoryItem.findMany();
};

export const createInventory = async (newItem) => {
  return await prisma.inventoryItem.create({
    data: {
      ...newItem,
      count: parseInt(newItem.count, 10),
      grams: parseFloat(newItem.grams),
    },
  });
};
export const updateInventory = async (newItem) => {
  return await prisma.inventoryItem.update({
    where: {
      id: newItem.id,
    },
    data: {
      ...newItem,
      count: parseInt(newItem.count, 10),
      grams: parseFloat(newItem.grams),
    },
  });
};
