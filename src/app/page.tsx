"use client";
import { select } from "three/tsl";
import AddInventory from "./add-inventory";
import HomePage from "./components/home";
import InventoryList from "./inventory-list";
import React, { useEffect, useState } from "react";
export interface Item {
  id?: number;
  category: string;
  location: string;
  name: string;
  grams: number;
  count: number;
  unit: string;
}
export interface InventoryGroup {
  category: string;
  items: Item[];
}
export default function Home() {
  const defaultSelectedItem: Item = {
    category: "",
    name: "",
    location: "",
    grams: 0,
    count: 0,
    unit: "",
  };
  const emptyInventory: Item[] = [];
  const [openAddInventoryModal, setOpenAddInventoryModal] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] =
    useState(defaultSelectedItem);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [inventoryList, setInventoryList] = useState(emptyInventory);
  const [filteredInventoryList, setFilteredInventoryList] =
    useState(emptyInventory);
  const fetchInventory = async () => {
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      setInventoryList(data);
    } catch (error) {
      console.error("Error fetching inventory: ", error);
    }
  };
  useEffect(() => {
    fetchInventory();
  }, []);
  const handleSelectInventoryItem = async (item: Item) => {
    setSelectedInventoryItem(item);
    setOpenAddInventoryModal(true);
  };
  const handleDataFromAddInventory = async (data: {
    id?: number;
    category: string;
    name: string;
    quantityInGrams: number;
    count: number;
    location: string;
    units: string;
  }) => {
    const newItem = {
      id: data.id,
      category: data.category,
      name: data.name,
      grams: data.quantityInGrams,
      count: data.count,
      location: data.location,
      unit: data.units,
    };
    await fetch("/api/inventory", {
      method: newItem.id ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newItem),
    })
      .then(() => {
        setSelectedInventoryItem(defaultSelectedItem);
        fetchInventory();
      })
      .catch((error) => {
        console.error("Error adding data: ", error);
      });
  };
  const showInventory = (name: string) => {
    setSelectedLocation(name);
    setFilteredInventoryList(
      inventoryList.filter((inventory) => inventory.location === name),
    );
  };
  return (
    <div style={{ width: "90dvw", height: "90dvh" }}>
      <HomePage showInventory={showInventory} />
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
            inventoryList={filteredInventoryList}
            openAddInventoryModal={() => setOpenAddInventoryModal(true)}
            selectInventoryItem={handleSelectInventoryItem}
          />
        </div>
      ) : (
        <></>
      )}
      <AddInventory
        location={selectedLocation}
        sendDataToHome={handleDataFromAddInventory}
        closeAddInventoryModal={() => {
          setOpenAddInventoryModal(false);
          setSelectedInventoryItem(defaultSelectedItem);
        }}
        openAddInventoryModal={openAddInventoryModal}
        selectedInventoryItem={selectedInventoryItem}
      />
    </div>
  );
}
