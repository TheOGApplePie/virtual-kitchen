import { NextResponse } from "next/server";
import { inventory } from "../../controllers/inventory.controller"; // adjust this if paths differ

export async function GET() {
  try {
    const items = await inventory.getAllInventoryItems();
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error in route:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const newItem = await request.json();
    await inventory.createInventoryItem(newItem);
    return NextResponse.json(newItem);
  } catch (error) {
    console.error("Error in route:", error);
    return NextResponse.json(
      { error: "Failed to create inventory" },
      { status: 500 },
    );
  }
}
export async function PUT(request: Request) {
  try {
    const newItem = await request.json();
    await inventory.updateInventoryItem(newItem);
    return NextResponse.json(newItem);
  } catch (error) {
    console.error("Error in route:", error);
    return NextResponse.json(
      { error: "Failed to update inventory" },
      { status: 500 },
    );
  }
}
