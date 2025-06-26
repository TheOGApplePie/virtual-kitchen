import { inventory } from "@/app/controllers/inventory.controller";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const deleted = await inventory.deleteInventoryItem(parseInt(id));
    return NextResponse.json(deleted);
  } catch (error) {
    console.error("Error in route:", error);
    return NextResponse.json(
      { error: "Failed to delete inventory" },
      { status: 500 },
    );
  }
}
