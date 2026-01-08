export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  type: "power-up" | "gadget" | "cosmetic";
  effect?: string;
  duration?: number;
}

export const shopItems: ShopItem[] = [
  {
    id: "shield",
    name: "Scudo",
    description: "Proteggi il giocatore da un colpo",
    price: 100,
    icon: "shield-icon",
    type: "power-up",
    duration: 10,
  },
  {
    id: "speed-boost",
    name: "Velocità",
    description: "Aumenta la velocità del giocatore",
    price: 80,
    icon: "speed-icon",
    type: "power-up",
    duration: 8,
  },
  {
    id: "laser",
    name: "Laser",
    description: "Spara laser per eliminare nemici",
    price: 150,
    icon: "laser-icon",
    type: "gadget",
    duration: 5,
  },
  {
    id: "magnet",
    name: "Magnete",
    description: "Attira automaticamente i punti",
    price: 120,
    icon: "magnet-icon",
    type: "gadget",
    duration: 12,
  },
  {
    id: "ice-power",
    name: "Potere Ghiaccio",
    description: "Congela i nemici temporaneamente",
    price: 130,
    icon: "ice-icon",
    type: "power-up",
    duration: 6,
  },
  {
    id: "lava-power",
    name: "Potere Lava",
    description: "Brucia i nemici intorno a te",
    price: 140,
    icon: "lava-icon",
    type: "power-up",
    duration: 7,
  },
  {
    id: "double-points",
    name: "Punti Doppi",
    description: "Raddoppia i punti guadagnati",
    price: 200,
    icon: "points-icon",
    type: "gadget",
    duration: 15,
  },
  {
    id: "invincibility",
    name: "Invincibilità",
    description: "Diventa invincibile per un breve periodo",
    price: 250,
    icon: "star-icon",
    type: "power-up",
    duration: 5,
  },
];

export function getShopItemById(id: string): ShopItem | undefined {
  return shopItems.find((item) => item.id === id);
}

export function getShopItemsByType(
  type: ShopItem["type"]
): ShopItem[] {
  return shopItems.filter((item) => item.type === type);
}

export interface PlayerInventory {
  [itemId: string]: number; // Quantità di ogni item
}

export function createEmptyInventory(): PlayerInventory {
  const inventory: PlayerInventory = {};
  shopItems.forEach((item) => {
    inventory[item.id] = 0;
  });
  return inventory;
}

export function addItemToInventory(
  inventory: PlayerInventory,
  itemId: string,
  quantity: number = 1
): PlayerInventory {
  return {
    ...inventory,
    [itemId]: (inventory[itemId] || 0) + quantity,
  };
}

export function removeItemFromInventory(
  inventory: PlayerInventory,
  itemId: string,
  quantity: number = 1
): PlayerInventory {
  const current = inventory[itemId] || 0;
  return {
    ...inventory,
    [itemId]: Math.max(0, current - quantity),
  };
}

export function hasItem(
  inventory: PlayerInventory,
  itemId: string
): boolean {
  return (inventory[itemId] || 0) > 0;
}

export function getInventoryValue(inventory: PlayerInventory): number {
  let total = 0;
  Object.entries(inventory).forEach(([itemId, quantity]) => {
    const item = getShopItemById(itemId);
    if (item) {
      total += item.price * quantity;
    }
  });
  return total;
}
