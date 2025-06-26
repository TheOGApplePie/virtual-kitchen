"use client";
import { Canvas } from "@react-three/fiber";
import Kitchen from "../kitchen";
import { useState } from "react";
import CameraController from "../perspective-camera";
import { Vector3 } from "three";
import "./home.css";
import { Item } from "@/app/page";
import InventoryList from "../inventory-list";
import AddInventory from "../add-inventory";
interface HomePageProps {
  inventoryList: Item[];
}
const HomePage = ({ inventoryList }: HomePageProps) => {
  const DEFAULT_POSITION = new Vector3(-5, 5, -5);
  const DEFAULT_LOOK_AT = new Vector3(6, 1, 5);
  const defaultSelectedItem: Item = {
    category: "",
    name: "",
    location: "",
    grams: 0,
    count: 0,
    unit: "",
  };
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [lookAt, setLookAt] = useState(DEFAULT_LOOK_AT);
  const [showHome, setShowHome] = useState(false);
  const [openAddInventoryModal, setOpenAddInventoryModal] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] =
    useState(defaultSelectedItem);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [filteredInventoryList, setFilteredInventoryList] =
    useState(inventoryList);

  function handleMoveTo(newVector: [Vector3, Vector3, string]) {
    setPosition(newVector[0]);
    setLookAt(newVector[1]);
    setSelectedLocation(newVector[2]);
    setFilteredInventoryList(
      inventoryList.filter((inventory) => inventory.location === newVector[2]),
    );
    setShowHome(newVector[2].length > 0);
  }
  function handleSelectInventoryItem(item: Item) {
    setSelectedInventoryItem(item);
    setOpenAddInventoryModal(true);
  }

  function handleSearchInventory(name: string) {
    setFilteredInventoryList(
      name
        ? filteredInventoryList.filter((inventory) =>
            inventory.name.includes(name),
          )
        : inventoryList.filter(
            (inventory) => inventory.location === selectedLocation,
          ),
    );
  }
  async function handleCloseAddInventoryModal(fetchData = false) {
    setOpenAddInventoryModal(false);
    setSelectedInventoryItem(defaultSelectedItem);
    if (fetchData) {
      await fetch("/api/inventory").then((response) => {
        response.json().then((updatedItems: Item[]) => {
          setFilteredInventoryList(
            updatedItems.filter(
              (inventory) => inventory.location === selectedLocation,
            ),
          );
        });
      });
    }
  }

  return (
    <>
      <Canvas>
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
            className="clickable"
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
      {selectedLocation ? (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "rgba(50,50,50,0.9)",
            padding: "10px",
            borderRadius: "8px",
            zIndex: 10,
          }}
        >
          <InventoryList
            location={selectedLocation}
            inventoryList={filteredInventoryList}
            openAddInventoryModal={() => setOpenAddInventoryModal(true)}
            selectInventoryItem={handleSelectInventoryItem}
            searchInventory={handleSearchInventory}
          />
        </div>
      ) : (
        <></>
      )}
      {openAddInventoryModal ? (
        <AddInventory
          location={selectedLocation}
          closeAddInventoryModalAction={handleCloseAddInventoryModal}
          openAddInventoryModal={openAddInventoryModal}
          selectedInventoryItem={selectedInventoryItem}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default HomePage;
