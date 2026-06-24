import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function SceneLights() {
  const { scene } = useThree();

  useEffect(() => {
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);

    const hemisphere = new THREE.HemisphereLight(0xe8f4ff, 0x2a2a3e, 1.6);

    const directional = new THREE.DirectionalLight(0xfff8f0, 3);
    directional.position.set(5, 14, 8);
    directional.castShadow = true;
    directional.shadow.mapSize.set(2048, 2048);

    const fill = new THREE.DirectionalLight(0xd0e8ff, 1.2);
    fill.position.set(-8, 6, -6);

    const point = new THREE.PointLight(0xffd580, 1.4, 24);
    point.position.set(0, 6, 0);

    scene.add(ambient, hemisphere, directional, fill, point);
    return () => {
      scene.remove(ambient, hemisphere, directional, fill, point);
    };
  }, [scene]);

  return null;
}
