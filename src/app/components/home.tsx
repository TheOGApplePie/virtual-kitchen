import { Canvas } from "@react-three/fiber";
import Kitchen from "./kitchen";
import { useState } from "react";
import CameraController from "./perspective-camera";
import { Vector3 } from "three";

const HomePage = ({ showInventory }) => {
  const DEFAULT_POSITION = new Vector3(-5, 5, -5);
  const DEFAULT_LOOK_AT = new Vector3(6, 1, 5);
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [lookAt, setLookAt] = useState(DEFAULT_LOOK_AT);
  const [showHome, setShowHome] = useState(false);
  function handleMoveTo(newVector: [Vector3, Vector3, string]) {
    setPosition(newVector[0]);
    setLookAt(newVector[1]);
    showInventory(newVector[2]);
    setShowHome(newVector[2].length > 0);
  }
  return (
    <>
      <Canvas>
        <gridHelper args={[10, 10]} />
        <ambientLight />
        <Kitchen moveTo={handleMoveTo} />
        <CameraController position={position} lookAt={lookAt} />
      </Canvas>
      {showHome ? (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            background: "rgba(50,50,50,0.9)",
            padding: "10px",
            borderRadius: "8px",
            zIndex: 10,
          }}
        >
          <button
            onClick={() =>
              handleMoveTo([DEFAULT_POSITION, DEFAULT_LOOK_AT, ""])
            }
          >
            Go Home
          </button>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default HomePage;
