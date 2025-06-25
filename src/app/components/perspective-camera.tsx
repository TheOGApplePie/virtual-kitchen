import { useThree, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Vector3 } from "three";

type Props = {
  position: Vector3;
  lookAt: Vector3;
};

export default function CameraController({ position, lookAt }: Props) {
  const { camera } = useThree();
  const vec = useRef(position);
  const lookVec = useRef(lookAt);
  useFrame(() => {
    vec.current.lerp(new Vector3(...position), 0.05);
    lookVec.current.lerp(new Vector3(...lookAt), 0.05);
    camera.position.copy(vec.current);
    camera.lookAt(lookVec.current);
  });

  return null;
}
