"use client";

import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { shopItems, type ShopItem } from "@/utils/shopItems";
import { useState, useEffect } from "react";

export default function ShopPage() {
  const { user } = useUser();
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [coins, setCoins] = useState(0);

  // Carica inventario da localStorage
  useEffect(() => {
    if (user) {
      const savedInventory = localStorage.getItem(`inventory_${user.id}`);
      const savedCoins = localStorage.getItem(`coins_${user.id}`);

      if (savedInventory) {
        setInventory(JSON.parse(savedInventory));
      }
      if (savedCoins) {
        setCoins(parseInt(savedCoins));
      }
    }
  }, [user]);

  const handleBuyItem = (item: ShopItem) => {
    if (coins >= item.price) {
      setCoins(coins - item.price);
      setInventory((prev) => ({
        ...prev,
        [item.id]: (prev[item.id] || 0) + 1,
      }));

      // Salva in localStorage
      if (user) {
        localStorage.setItem(`coins_${user.id}`, String(coins - item.price));
        localStorage.setItem(
          `inventory_${user.id}`,
          JSON.stringify({
            ...inventory,
            [item.id]: (inventory[item.id] || 0) + 1,
          })
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Shop SnakeCraft</h1>

        <SignedOut>
          <div className="text-center py-12">
            <p className="text-white text-xl mb-4">
              Accedi per accedere allo shop
            </p>
            <SignInButton mode="modal" />
          </div>
        </SignedOut>

        <SignedIn>
          <div className="mb-8 flex justify-between items-center">
            <div className="text-white text-2xl font-bold">
              Monete: {coins}
            </div>
            <Button
              onClick={() => {
                setCoins(coins + 1000);
                if (user) {
                  localStorage.setItem(`coins_${user.id}`, String(coins + 1000));
                }
              }}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              Aggiungi Monete (Test)
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shopItems.map((item) => (
              <Card
                key={item.id}
                className="bg-gray-800 border-gray-700 hover:border-gray-500 transition"
              >
                <CardHeader>
                  <CardTitle className="text-white">{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-400 font-bold text-lg">
                      {item.price} 🪙
                    </span>
                    <span className="text-gray-400">
                      Posseduti: {inventory[item.id] || 0}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleBuyItem(item)}
                    disabled={coins < item.price}
                    className="w-full mt-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-600"
                  >
                    Acquista
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </SignedIn>
      </div>
    </div>
  );
}
