import { useMemo, useRef } from "react";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { KITCHEN_ZONES, KitchenZone } from "@/config/kitchenZones";
import { ZoneStatus } from "@/app/lib/inventory-helpers";

type Props = {
  zoneData: Record<string, { count: number; status: ZoneStatus }>;
  highlightZones: string[];
  focusedZoneId: string | null;
  onZoneClick: (zone: KitchenZone) => void;
};

const STATUS_TINT: Record<ZoneStatus, { color: number; opacity: number }> = {
  expired: { color: 0xef5350, opacity: 0.22 },
  expiring: { color: 0xffd93d, opacity: 0.16 },
  safe: { color: 0x4ecdc4, opacity: 0.08 },
  empty: { color: 0x000000, opacity: 0 },
};

function ZoneAura({ zone, zoneData, highlightZones, focusedZoneId }: {
  zone: KitchenZone;
  zoneData: Props["zoneData"];
  highlightZones: string[];
  focusedZoneId: string | null;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const status = zoneData[zone.id]?.status ?? "empty";
  const highlighted = highlightZones.includes(zone.id);
  const focused = focusedZoneId === zone.id;

  useFrame((state) => {
    if (!ref.current) return;
    const pulse = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 2.2);
    const tint = STATUS_TINT[status];
    let color = tint.color;
    let opacity = tint.opacity * (status === "expired" || status === "expiring" ? 0.6 + 0.4 * pulse : 1);
    if (highlighted) {
      color = 0xffffff;
      opacity = 0.14 + 0.18 * pulse;
    } else if (focused) {
      color = 0xffffff;
      opacity = Math.max(opacity, 0.1) + 0.06 * pulse;
    }
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.color.setHex(color);
    mat.opacity = opacity;
  });

  return (
    <mesh ref={ref} position={zone.position} renderOrder={2}>
      <boxGeometry args={[zone.auraSize.x, zone.auraSize.y, zone.auraSize.z]} />
      <meshBasicMaterial color={0x000000} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

function ZoneLabel({ zone, zoneData }: { zone: KitchenZone; zoneData: Props["zoneData"] }) {
  const count = zoneData[zone.id]?.count ?? 0;
  return (
    <Html position={zone.labelPosition} center>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "rgba(15,20,25,0.9)",
          border: `1px solid ${zone.color}`,
          borderRadius: "16px",
          padding: "6px 14px",
          color: "#F5F5F0",
          fontSize: "13px",
          fontWeight: 700,
          letterSpacing: "0.04em",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
      >
        <span>{zone.location.toUpperCase()}</span>
        <span style={{ color: zone.color }}>
          {count} {count === 1 ? "item" : "items"}
        </span>
      </div>
    </Html>
  );
}

const mat = (color: number, roughness = 0.85, metalness = 0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

const COLORS = {
  wall: 0xcbc4b4,
  floor1: 0xcac3b3,
  floor2: 0xaec0a4,
  cabinet: 0x93ac8a,
  cabinetDark: 0x7f9977,
  counter: 0xcfc4ad,
  fridge: 0xa6c495,
  fridgeTrim: 0x9bbb89,
  white: 0xded9ce,
  wood: 0xd9c3a0,
  woodDark: 0xc7ae86,
};

function Room() {
  const tileSize = 0.9;
  const tilesN = 9;
  const tiles = useMemo(() => {
    const positions: { x: number; z: number; alt: boolean }[] = [];
    for (let i = 0; i < tilesN; i++) {
      for (let j = 0; j < tilesN; j++) {
        positions.push({
          x: (i - tilesN / 2 + 0.5) * tileSize,
          z: (j - tilesN / 2 + 0.5) * tileSize,
          alt: (i + j) % 2 === 0,
        });
      }
    }
    return positions;
  }, []);

  return (
    <>
      {tiles.map((t, idx) => (
        <mesh key={idx} rotation-x={-Math.PI / 2} position={[t.x, 0, t.z]} receiveShadow>
          <planeGeometry args={[tileSize, tileSize]} />
          <meshStandardMaterial color={t.alt ? COLORS.floor1 : COLORS.floor2} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 2.1, -3.6]}>
        <boxGeometry args={[8.1, 4.2, 0.15]} />
        <meshStandardMaterial color={COLORS.wall} />
      </mesh>
      <mesh position={[-3.6, 2.1, 0]}>
        <boxGeometry args={[0.15, 4.2, 8.1]} />
        <meshStandardMaterial color={COLORS.wall} roughness={0.9} />
      </mesh>
      {/* Counter run */}
      <mesh position={[-0.3, 0.5, -3.05]} castShadow receiveShadow>
        <boxGeometry args={[6, 1, 0.85]} />
        <meshStandardMaterial color={COLORS.cabinet} />
      </mesh>
      <mesh position={[-0.3, 1.06, -3.02]} castShadow receiveShadow>
        <boxGeometry args={[6.2, 0.12, 0.9]} />
        <meshStandardMaterial color={COLORS.counter} roughness={0.6} />
      </mesh>
    </>
  );
}

// Fridge (top unit) and Freezer (bottom drawer) are each owned entirely by
// their own zone group — no mesh is shared between the two — so a click
// always raycasts to exactly one zone's geometry instead of landing on two
// overlapping meshes from different groups at the same height.
function FridgeUnit({ zone }: { zone: KitchenZone }) {
  const x = zone.position.x;
  const z = zone.position.z;
  return (
    <group>
      <mesh position={[x, 1.55, z]} castShadow receiveShadow>
        <boxGeometry args={[1.25, 1.25, 1]} />
        <meshStandardMaterial color={COLORS.fridge} roughness={0.45} />
      </mesh>
      <mesh position={[x, 2.18, z]} castShadow>
        <boxGeometry args={[1.25, 0.12, 1]} />
        <meshStandardMaterial color={COLORS.fridge} roughness={0.45} />
      </mesh>
      <mesh position={[x - 0.5, 1.55, z + 0.52]} castShadow>
        <boxGeometry args={[0.06, 0.7, 0.08]} />
        <meshStandardMaterial color={COLORS.white} roughness={0.4} />
      </mesh>
    </group>
  );
}

function FreezerDrawer({ zone }: { zone: KitchenZone }) {
  const x = zone.position.x;
  const z = zone.position.z;
  return (
    <group>
      <mesh position={[x, 0.5, z]} castShadow receiveShadow>
        <boxGeometry args={[1.25, 0.95, 1]} />
        <meshStandardMaterial color={COLORS.fridgeTrim} roughness={0.45} />
      </mesh>
      <mesh position={[x, 0.7, z + 0.51]} castShadow>
        <boxGeometry args={[1.1, 0.02, 0.02]} />
        <meshStandardMaterial color={COLORS.white} roughness={0.4} />
      </mesh>
      <mesh position={[x - 0.5, 0.5, z + 0.52]} castShadow>
        <boxGeometry args={[0.06, 0.45, 0.08]} />
        <meshStandardMaterial color={COLORS.white} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Pantry({ zone }: { zone: KitchenZone }) {
  const x = zone.position.x;
  const z = zone.position.z;
  return (
    <group>
      <mesh position={[x, 1.3, z]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 2.5, 0.8]} />
        <meshStandardMaterial color={COLORS.cabinet} roughness={0.7} />
      </mesh>
      <mesh position={[x, 1.3, z]}>
        <boxGeometry args={[0.04, 2.3, 0.82]} />
        <meshStandardMaterial color={COLORS.cabinetDark} />
      </mesh>
      <mesh position={[x - 0.18, 1.3, z + 0.4]}>
        <boxGeometry args={[0.05, 0.4, 0.06]} />
        <meshStandardMaterial color={COLORS.woodDark} roughness={0.5} />
      </mesh>
      <mesh position={[x + 0.18, 1.3, z + 0.4]}>
        <boxGeometry args={[0.05, 0.4, 0.06]} />
        <meshStandardMaterial color={COLORS.woodDark} roughness={0.5} />
      </mesh>
    </group>
  );
}

function Spices({ zone }: { zone: KitchenZone }) {
  const x = zone.position.x;
  const z = zone.position.z;
  const jarPalette = [0xff6b5b, 0xff9f6b, 0xffd93d, 0x8b5a2b, 0xe05b4b, 0x6fa368];
  const shelves = [1.45, 2.05];
  return (
    <group>
      {shelves.map((shelfY, si) => (
        <group key={shelfY}>
          <mesh position={[x, shelfY, z]} castShadow receiveShadow>
            <boxGeometry args={[0.55, 0.07, 1.7]} />
            <meshStandardMaterial color={COLORS.wood} roughness={0.7} />
          </mesh>
          {Array.from({ length: 5 }).map((_, k) => (
            <group key={k} position={[x, shelfY + 0.16, z - 0.62 + k * 0.31]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.085, 0.085, 0.26, 12]} />
                <meshStandardMaterial color={jarPalette[(si * 5 + k) % jarPalette.length]} roughness={0.4} />
              </mesh>
              <mesh position={[0, 0.16, 0]}>
                <cylinderGeometry args={[0.09, 0.09, 0.06, 12]} />
                <meshStandardMaterial color={COLORS.woodDark} roughness={0.5} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

export default function Kitchen({ zoneData, highlightZones, focusedZoneId, onZoneClick }: Props) {
  const handleClick = (zone: KitchenZone) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onZoneClick(zone);
  };

  return (
    <>
      <Room />
      {KITCHEN_ZONES.map((zone) => (
        <group key={zone.id} onClick={handleClick(zone)} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = "default"; }}>
          {zone.id === "fridge" && <FridgeUnit zone={zone} />}
          {zone.id === "freezer" && <FreezerDrawer zone={zone} />}
          {zone.id === "pantry" && <Pantry zone={zone} />}
          {zone.id === "spices" && <Spices zone={zone} />}
          <ZoneAura zone={zone} zoneData={zoneData} highlightZones={highlightZones} focusedZoneId={focusedZoneId} />
        </group>
      ))}
      {KITCHEN_ZONES.map((zone) => (
        <ZoneLabel key={zone.id} zone={zone} zoneData={zoneData} />
      ))}
    </>
  );
}
