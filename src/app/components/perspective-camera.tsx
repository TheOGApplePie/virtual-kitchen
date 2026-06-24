import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { KITCHEN_ZONES, ORBIT_CENTER, ORBIT_RADIUS, ORBIT_HEIGHT } from "@/config/kitchenZones";

type Mode = "orbit" | "flying" | "focused";

type Props = {
  pendingZoneId: string | null;
  pendingItemId: number | null;
  onArrived: (zoneId: string, itemId: number | null) => void;
};

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// Gentle side-to-side sweep instead of a full orbit: ±45° around the base angle,
// 30 seconds to sweep from one extreme to the other (60s full back-and-forth).
const OSCILLATION_AMPLITUDE = Math.PI / 4;
const OSCILLATION_PERIOD = 60;

export default function CameraRig({ pendingZoneId, pendingItemId, onArrived }: Props) {
  const { camera, gl } = useThree();

  const baseAngle = useRef(0.7);
  const oscPhase = useRef(0);
  const camHeight = useRef(ORBIT_HEIGHT);
  const mode = useRef<Mode>("orbit");
  const flyingHome = useRef(false);
  const flyT = useRef(0);
  const flyStartPos = useRef(new THREE.Vector3());
  const flyEndPos = useRef(new THREE.Vector3());
  const flyStartLook = useRef(new THREE.Vector3());
  const flyEndLook = useRef(new THREE.Vector3());
  const currentLookAt = useRef(ORBIT_CENTER.clone());
  const prevZoneId = useRef<string | null>(null);
  const pendingItemRef = useRef<number | null>(null);
  const arrivedCalled = useRef(false);

  const isDragging = useRef(false);
  const prevPointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    pendingItemRef.current = pendingItemId;
  }, [pendingItemId]);

  const currentOrbitAngle = () => baseAngle.current + OSCILLATION_AMPLITUDE * Math.sin(oscPhase.current);

  useEffect(() => {
    const angle = currentOrbitAngle();
    camera.position.set(
      ORBIT_CENTER.x + Math.sin(angle) * ORBIT_RADIUS,
      camHeight.current,
      ORBIT_CENTER.z + Math.cos(angle) * ORBIT_RADIUS,
    );
    camera.lookAt(ORBIT_CENTER);
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = gl.domElement;
    const onDown = (e: PointerEvent) => {
      isDragging.current = true;
      prevPointer.current = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e: PointerEvent) => {
      if (!isDragging.current || mode.current !== "orbit") return;
      const dx = e.clientX - prevPointer.current.x;
      const dy = e.clientY - prevPointer.current.y;
      baseAngle.current -= dx * 0.006;
      camHeight.current = Math.max(1.6, Math.min(6.5, camHeight.current - dy * 0.02));
      prevPointer.current = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => {
      isDragging.current = false;
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointerleave", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointerleave", onUp);
    };
  }, [gl]);

  useEffect(() => {
    if (pendingZoneId === prevZoneId.current) return;
    prevZoneId.current = pendingZoneId;
    arrivedCalled.current = false;

    if (pendingZoneId) {
      const zone = KITCHEN_ZONES.find((z) => z.id === pendingZoneId);
      if (!zone) return;
      const dir = new THREE.Vector3(
        ORBIT_CENTER.x - zone.focusPoint.x,
        0,
        ORBIT_CENTER.z - zone.focusPoint.z,
      ).normalize();
      flyEndPos.current.copy(zone.focusPoint).add(dir.multiplyScalar(3.4));
      flyEndPos.current.y = zone.focusPoint.y + 1.1;
      flyEndLook.current.copy(zone.focusPoint);
      flyStartPos.current.copy(camera.position);
      flyStartLook.current.copy(currentLookAt.current);
      mode.current = "flying";
      flyingHome.current = false;
      flyT.current = 0;
    } else {
      const angle = currentOrbitAngle();
      const orbitPos = new THREE.Vector3(
        ORBIT_CENTER.x + Math.sin(angle) * ORBIT_RADIUS,
        camHeight.current,
        ORBIT_CENTER.z + Math.cos(angle) * ORBIT_RADIUS,
      );
      flyEndPos.current.copy(orbitPos);
      flyEndLook.current.copy(ORBIT_CENTER);
      flyStartPos.current.copy(camera.position);
      flyStartLook.current.copy(currentLookAt.current);
      mode.current = "flying";
      flyingHome.current = true;
      flyT.current = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingZoneId]);

  useFrame((_state, delta) => {
    if (mode.current === "flying") {
      flyT.current = Math.min(1, flyT.current + 0.024);
      const e = easeInOut(flyT.current);
      camera.position.lerpVectors(flyStartPos.current, flyEndPos.current, e);
      currentLookAt.current.lerpVectors(flyStartLook.current, flyEndLook.current, e);
      camera.lookAt(currentLookAt.current);
      if (flyT.current >= 1) {
        if (flyingHome.current) {
          mode.current = "orbit";
          flyingHome.current = false;
        } else {
          mode.current = "focused";
          if (!arrivedCalled.current && prevZoneId.current) {
            arrivedCalled.current = true;
            onArrived(prevZoneId.current, pendingItemRef.current);
          }
        }
      }
    } else if (mode.current === "focused") {
      camera.lookAt(currentLookAt.current);
    } else {
      if (!isDragging.current) oscPhase.current += delta * ((2 * Math.PI) / OSCILLATION_PERIOD);
      const angle = currentOrbitAngle();
      camera.position.set(
        ORBIT_CENTER.x + Math.sin(angle) * ORBIT_RADIUS,
        camHeight.current,
        ORBIT_CENTER.z + Math.cos(angle) * ORBIT_RADIUS,
      );
      currentLookAt.current.lerp(ORBIT_CENTER, 0.15);
      camera.lookAt(currentLookAt.current);
    }
  });

  return null;
}
