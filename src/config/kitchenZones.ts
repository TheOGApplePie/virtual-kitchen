import { Vector3 } from "three";

// World-space layout for the procedural 3D kitchen (see src/app/components/kitchen.tsx).
// `location` must match the `location` field stored on inventory items.
export const KITCHEN_ZONES = [
  {
    id: "fridge",
    location: "Fridge",
    color: "#4ECDC4",
    position: new Vector3(2.75, 1.55, -2.95),
    focusPoint: new Vector3(2.75, 1.7, -2.95),
    auraSize: new Vector3(1.5, 1.45, 1.18),
    labelPosition: new Vector3(2.75, 2.95, -2.95),
  },
  {
    id: "freezer",
    location: "Freezer",
    color: "#42A5F5",
    position: new Vector3(2.75, 0.5, -2.95),
    focusPoint: new Vector3(2.75, 0.6, -2.95),
    auraSize: new Vector3(1.5, 1, 1.18),
    labelPosition: new Vector3(2.7, 0.5, -2),
  },
  {
    id: "pantry",
    location: "Pantry",
    color: "#FFD93D",
    position: new Vector3(-2.75, 1.3, -3),
    focusPoint: new Vector3(-2.75, 1.5, -3),
    auraSize: new Vector3(1.35, 2.65, 0.95),
    labelPosition: new Vector3(-2.75, 2.95, -3),
  },
  {
    id: "spices",
    location: "Spices",
    color: "#FF9F6B",
    position: new Vector3(-3.45, 1.75, -0.6),
    focusPoint: new Vector3(-3.15, 1.85, -0.6),
    auraSize: new Vector3(0.78, 1.15, 1.95),
    labelPosition: new Vector3(-2.95, 2.6, -0.6),
  },
] as const;

export type KitchenZone = (typeof KITCHEN_ZONES)[number];

export const ORBIT_CENTER = new Vector3(0, 1.1, -0.3);
export const ORBIT_RADIUS = 8.2;
export const ORBIT_HEIGHT = 3.6;
