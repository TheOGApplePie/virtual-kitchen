import { useEffect, useState } from "react";
import { MTLLoader, OBJLoader } from "three-stdlib";
import * as THREE from "three";

const objectLocations = [
  {
    name: "Fridge_Cube.018",
    location: "Fridge",
    position: new THREE.Vector3(-2, 3, 0),
    lookAt: new THREE.Vector3(-2, 3, 1),
  },
  {
    name: "Wall_shelf_Icosphere.005",
    location: "Spice Cabinet",
    position: new THREE.Vector3(1, 4, 0),
    lookAt: new THREE.Vector3(1, 4, 1),
  },
  {
    name: "Counter_Icosphere",
    location: "Pantry",
    position: new THREE.Vector3(-0.2, 1.5, -1.5),
    lookAt: new THREE.Vector3(1, 1.5, -1.5),
  },
];
export default function Kitchen({ moveTo }) {
  const [model, setModel] = useState<THREE.Group | null>(null);

  function findCoordinatesAndMoveToIt(name: string) {
    const foundObject = objectLocations.find((object) => object.name === name);
    moveTo([
      foundObject?.position ?? new THREE.Vector3(-5, 5, -5),
      foundObject?.lookAt ?? new THREE.Vector3(6, 1, 5),
      foundObject ? foundObject.location : "",
    ]);
  }
  useEffect(() => {
    const mtlLoader = new MTLLoader();
    mtlLoader.setResourcePath("/models/"); // path for texture images if needed
    mtlLoader.setPath("/models/"); // path for .mtl file

    mtlLoader.load("kitchen.mtl", (materials) => {
      materials.preload();

      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath("/models/");
      objLoader.load("kitchen.obj", (object) => {
        setModel(object);
      });
    });
  }, []);
  useEffect(() => {
    if (!model) return;
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.userData = { clickable: true }; // optional tagging
      }
    });
  }, [model]);
  return model ? (
    <primitive
      object={model}
      onClick={(e: any) => {
        e.stopPropagation();
        const clickedMesh = e.object;
        if (clickedMesh.userData.clickable) {
          findCoordinatesAndMoveToIt(clickedMesh.name);
        }
      }}
      onPointerOver={(e: Event) => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
    />
  ) : null;
}
