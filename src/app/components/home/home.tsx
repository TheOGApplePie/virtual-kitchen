"use client";
import { Canvas } from "@react-three/fiber";
import Kitchen from "../kitchen";
import { useMemo, useState } from "react";
import CameraRig from "../perspective-camera";
import "./home.css";
import { Item } from "@/types/inventory";
import { Recipe } from "@/types/recipe";
import AddInventory, { AddInventoryCloseResult } from "../add-inventory";
import ErrorBoundary from "../error-boundary";
import SceneLights from "../scene-lights";
import SearchBar from "../search-bar";
import RightPanel from "../right-panel";
import ShowAllModal from "../show-all-modal";
import ConsumeModal from "../consume-modal";
import MobileInventory from "../mobile-inventory";
import useIsDesktop from "@/app/hooks/use-is-desktop";
import { ZONES, zoneStatusFor, zoneIdFromLocation, decorateItem } from "@/app/lib/inventory-helpers";
import { deleteItem, consumeItems } from "@/app/actions/inventory.actions";

const defaultItem: Item = {
  category: "",
  name: "",
  location: "",
  quantity: 0,
  count: 0,
  unit: "",
};

type ConsumeState = { title: string; items: Item[] } | null;

type Props = {
  initialInventory: Item[];
  initialRecipes: Recipe[];
  initialError: string | null;
};

const HomePage = ({ initialInventory, initialRecipes, initialError }: Props) => {
  const isDesktop = useIsDesktop();

  const [inventoryList, setInventoryList] = useState<Item[]>(initialInventory);
  const [recipes] = useState<Recipe[]>(initialRecipes);
  const [error, setError] = useState<string | null>(initialError);

  // Desktop 3D focus state
  const [pendingZoneId, setPendingZoneId] = useState<string | null>(null);
  const [pendingItemId, setPendingItemId] = useState<number | null>(null);
  const [focusedZoneId, setFocusedZoneId] = useState<string | null>(null);
  const [focusedItemId, setFocusedItemId] = useState<number | null>(null);
  const [invSearch, setInvSearch] = useState("");
  const [showAllModal, setShowAllModal] = useState(false);

  const [openAddInventoryModal, setOpenAddInventoryModal] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<Item>(defaultItem);

  const [consume, setConsume] = useState<ConsumeState>(null);

  // Computed once per inventory change instead of every row in every list
  // re-deriving status/labels from the raw item on every render.
  const decoratedInventory = useMemo(() => inventoryList.map(decorateItem), [inventoryList]);

  const zoneData = useMemo(() => {
    const data: Record<string, { count: number; status: ReturnType<typeof zoneStatusFor> }> = {};
    ZONES.forEach((z) => {
      const items = inventoryList.filter((i) => i.location.toLowerCase() === z.name.toLowerCase());
      data[z.id] = { count: items.length, status: zoneStatusFor(items) };
    });
    return data;
  }, [inventoryList]);

  const term = invSearch.trim().toLowerCase();
  const highlightZones = useMemo(() => {
    if (!term) return [];
    const matches = inventoryList.filter((i) => i.name.toLowerCase().includes(term));
    const zoneIds = matches.map((i) => zoneIdFromLocation(i.location)).filter((id): id is NonNullable<typeof id> => !!id);
    return Array.from(new Set(zoneIds));
  }, [term, inventoryList]);

  function focusZoneAndItem(zoneId: string, itemId: number | null) {
    setInvSearch("");
    setShowAllModal(false);
    if (focusedZoneId === zoneId) {
      // Already there — just swap which item the right panel shows.
      setFocusedItemId(itemId);
      return;
    }
    setPendingItemId(itemId);
    setPendingZoneId(zoneId);
  }

  function handleZoneArrived(zoneId: string, itemId: number | null) {
    setFocusedZoneId(zoneId);
    setFocusedItemId(itemId);
  }

  function handleRecenter() {
    setPendingZoneId(null);
    setPendingItemId(null);
    setFocusedZoneId(null);
    setFocusedItemId(null);
    setInvSearch("");
  }

  function handleSelectInventoryItem(item: Item) {
    setSelectedInventoryItem(item);
    setOpenAddInventoryModal(true);
  }

  function handleCloseAddInventoryModal(result?: AddInventoryCloseResult) {
    setOpenAddInventoryModal(false);
    setSelectedInventoryItem(defaultItem);
    if (!result) return;

    setError(null);
    if (result.type === "saved") {
      const saved = result.item;
      setInventoryList((prev) =>
        prev.some((i) => i.id === saved.id) ? prev.map((i) => (i.id === saved.id ? saved : i)) : [...prev, saved],
      );
      // The edited item may have moved out of the zone currently shown in
      // the right panel — drop the stale focus rather than show a mismatch.
      const focusedZoneName = ZONES.find((z) => z.id === focusedZoneId)?.name;
      if (focusedZoneName && saved.location.toLowerCase() !== focusedZoneName.toLowerCase()) {
        handleRecenter();
      }
    } else {
      setInventoryList((prev) => prev.filter((i) => i.id !== result.id));
      if (focusedItemId === result.id) setFocusedItemId(null);
    }
  }

  async function persistConsumption(updates: { item: Item; use: number }[]) {
    const result = await consumeItems(updates.map(({ item, use }) => ({ id: item.id as number, use })));
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    const updatedMap = new Map(result.data.updated.map((i) => [i.id, i]));
    setInventoryList((prev) =>
      prev.filter((i) => !result.data.deletedIds.includes(i.id as number)).map((i) => updatedMap.get(i.id as number) ?? i),
    );
    if (result.data.deletedIds.includes(focusedItemId as number)) setFocusedItemId(null);
    setConsume(null);
  }

  async function handleRemoveItem(itemId: number) {
    const result = await deleteItem(itemId);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    setInventoryList((prev) => prev.filter((i) => i.id !== itemId));
    if (focusedItemId === itemId) setFocusedItemId(null);
  }

  const focusedZone = focusedZoneId ? ZONES.find((z) => z.id === focusedZoneId) ?? null : null;
  const zoneItems = focusedZoneId
    ? decoratedInventory.filter((i) => i.location.toLowerCase() === focusedZone?.name.toLowerCase())
    : [];
  const focusedItem = focusedItemId != null ? decoratedInventory.find((i) => i.id === focusedItemId) ?? null : null;

  const errorBanner = error && (
    <div className="error-banner">
      {error}
      <button className="modal-close" onClick={() => setError(null)}>✕</button>
    </div>
  );

  if (!isDesktop) {
    return (
      <>
        {errorBanner}
        <MobileInventory
          inventory={decoratedInventory}
          onConsumeOne={(item) => setConsume({ title: `Use ${item.name}`, items: [item] })}
          onConsumeMany={(items) => setConsume({ title: `Use ${items.length} items`, items })}
          onEdit={handleSelectInventoryItem}
        />
        <button className="fab" onClick={() => setOpenAddInventoryModal(true)}>
          +
        </button>
        {openAddInventoryModal && (
          <AddInventory
            location={selectedInventoryItem.location || ZONES[0].name}
            closeAddInventoryModalAction={handleCloseAddInventoryModal}
            selectedInventoryItem={selectedInventoryItem}
          />
        )}
        {consume && (
          <ConsumeModal
            title={consume.title}
            items={consume.items}
            onClose={() => setConsume(null)}
            onConfirm={persistConsumption}
          />
        )}
      </>
    );
  }

  return (
    <>
      {errorBanner}
      <div className="kitchen-stage">
        <ErrorBoundary fallback={<div className="canvas-error">3D scene unavailable</div>}>
          <Canvas shadows gl={{ antialias: true }}>
            <SceneLights />
            <Kitchen
              zoneData={zoneData}
              highlightZones={highlightZones}
              focusedZoneId={focusedZoneId}
              onZoneClick={(zone) => focusZoneAndItem(zone.id, null)}
            />
            <CameraRig
              pendingZoneId={pendingZoneId}
              pendingItemId={pendingItemId}
              onArrived={handleZoneArrived}
            />
          </Canvas>
        </ErrorBoundary>

        {focusedZoneId && (
          <button className="recenter-btn" onClick={handleRecenter}>
            ← Whole kitchen
          </button>
        )}

        <SearchBar
          value={invSearch}
          onChange={setInvSearch}
          inventory={decoratedInventory}
          onPick={(zoneId, itemId) => focusZoneAndItem(zoneId, itemId)}
        />

        {!focusedZoneId && !term && (
          <div className="kitchen-hint">Drag to look around • Click a zone to inspect • Search to locate an item</div>
        )}
      </div>

      {focusedZone && (
        <RightPanel
          zone={focusedZone}
          zoneItems={zoneItems}
          focusedItem={focusedItem}
          recipes={recipes}
          inventory={inventoryList}
          onClose={handleRecenter}
          onSelectItem={(itemId) => setFocusedItemId(itemId)}
          onBackToZone={() => setFocusedItemId(null)}
          onShowAll={() => setShowAllModal(true)}
          onConsume={(item) => setConsume({ title: `Use ${item.name}`, items: [item] })}
          onRemove={handleRemoveItem}
          onEdit={handleSelectInventoryItem}
        />
      )}

      {showAllModal && (
        <ShowAllModal
          inventory={decoratedInventory}
          onClose={() => setShowAllModal(false)}
          onPick={(zoneId, itemId) => focusZoneAndItem(zoneId, itemId)}
        />
      )}

      {consume && (
        <ConsumeModal
          title={consume.title}
          items={consume.items}
          onClose={() => setConsume(null)}
          onConfirm={persistConsumption}
        />
      )}

      {openAddInventoryModal && (
        <AddInventory
          location={selectedInventoryItem.location || focusedZone?.name || ZONES[0].name}
          closeAddInventoryModalAction={handleCloseAddInventoryModal}
          selectedInventoryItem={selectedInventoryItem}
        />
      )}

      <button className="fab" onClick={() => setOpenAddInventoryModal(true)}>
        +
      </button>
    </>
  );
};

export default HomePage;
