import { describe, it, expect } from "vitest";
import {
  shopItems,
  getShopItemById,
  getShopItemsByType,
  createEmptyInventory,
  addItemToInventory,
  removeItemFromInventory,
  hasItem,
  getInventoryValue,
} from "./shopItems";

describe("Shop Items", () => {
  it("should have valid shop items", () => {
    expect(shopItems.length).toBeGreaterThan(0);

    shopItems.forEach((item) => {
      expect(item.id).toBeDefined();
      expect(item.name).toBeDefined();
      expect(item.description).toBeDefined();
      expect(item.price).toBeGreaterThan(0);
      expect(item.type).toMatch(/power-up|gadget|cosmetic/);
    });
  });

  it("should get item by id", () => {
    const item = getShopItemById("shield");

    expect(item).toBeDefined();
    expect(item?.id).toBe("shield");
  });

  it("should return undefined for invalid id", () => {
    const item = getShopItemById("invalid-item");

    expect(item).toBeUndefined();
  });

  it("should get items by type", () => {
    const powerUps = getShopItemsByType("power-up");
    const gadgets = getShopItemsByType("gadget");

    expect(powerUps.length).toBeGreaterThan(0);
    expect(gadgets.length).toBeGreaterThan(0);

    powerUps.forEach((item) => {
      expect(item.type).toBe("power-up");
    });

    gadgets.forEach((item) => {
      expect(item.type).toBe("gadget");
    });
  });

  it("should create empty inventory", () => {
    const inventory = createEmptyInventory();

    shopItems.forEach((item) => {
      expect(inventory[item.id]).toBe(0);
    });
  });

  it("should add item to inventory", () => {
    let inventory = createEmptyInventory();

    inventory = addItemToInventory(inventory, "shield", 2);

    expect(inventory["shield"]).toBe(2);
  });

  it("should remove item from inventory", () => {
    let inventory = createEmptyInventory();
    inventory = addItemToInventory(inventory, "shield", 5);

    inventory = removeItemFromInventory(inventory, "shield", 2);

    expect(inventory["shield"]).toBe(3);
  });

  it("should not go below zero when removing", () => {
    let inventory = createEmptyInventory();
    inventory = addItemToInventory(inventory, "shield", 2);

    inventory = removeItemFromInventory(inventory, "shield", 5);

    expect(inventory["shield"]).toBe(0);
  });

  it("should check if item exists in inventory", () => {
    let inventory = createEmptyInventory();

    expect(hasItem(inventory, "shield")).toBe(false);

    inventory = addItemToInventory(inventory, "shield", 1);

    expect(hasItem(inventory, "shield")).toBe(true);
  });

  it("should calculate inventory value", () => {
    let inventory = createEmptyInventory();

    inventory = addItemToInventory(inventory, "shield", 2); // 100 * 2 = 200
    inventory = addItemToInventory(inventory, "speed-boost", 1); // 80 * 1 = 80

    const value = getInventoryValue(inventory);

    expect(value).toBe(280);
  });

  it("should handle multiple items in inventory", () => {
    let inventory = createEmptyInventory();

    inventory = addItemToInventory(inventory, "shield", 3);
    inventory = addItemToInventory(inventory, "laser", 1);
    inventory = addItemToInventory(inventory, "magnet", 2);

    expect(inventory["shield"]).toBe(3);
    expect(inventory["laser"]).toBe(1);
    expect(inventory["magnet"]).toBe(2);
  });
});
