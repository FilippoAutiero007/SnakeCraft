"use client";

import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo/Titolo */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-4">
            SnakeCraft
          </h1>
          <p className="text-xl text-gray-300">
            Un gioco di serpenti sfidante con biomi, boss e power-up
          </p>
        </div>

        {/* Sezione Autenticazione */}
        <SignedOut>
          <div className="mb-12 bg-gray-800 rounded-lg p-8 border border-gray-700">
            <p className="text-gray-300 mb-6">
              Accedi per accedere al gioco completo, alla classifica e allo shop
            </p>
            <SignInButton mode="modal">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-3">
                Accedi con Google
              </Button>
            </SignInButton>
          </div>
        </SignedOut>

        {/* Menu Principale */}
        <div className="space-y-4 mb-12">
          <Link href="/gioco" className="block">
            <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-6">
              🎮 Gioca Ora
            </Button>
          </Link>

          <SignedIn>
            <Link href="/classifica" className="block">
              <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-lg py-6">
                🏆 Classifica
              </Button>
            </Link>

            <Link href="/shop" className="block">
              <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold text-lg py-6">
                🛍️ Shop
              </Button>
            </Link>
          </SignedIn>
        </div>

        {/* Informazioni Gioco */}
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Caratteristiche</h2>
          <ul className="text-left text-gray-300 space-y-2">
            <li>✨ 5 biomi diversi con effetti unici</li>
            <li>👹 Boss sfidanti per ogni livello</li>
            <li>⚡ Power-up e gadget speciali</li>
            <li>📱 Controlli ottimizzati per PC e mobile</li>
            <li>🏅 Classifica mondiale e locale</li>
            <li>🎮 Livelli infiniti con difficoltà progressiva</li>
          </ul>
        </div>

        {/* Controlli */}
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">Controlli</h2>
          <div className="text-left text-gray-300 space-y-2">
            <p>
              <strong>PC:</strong> WASD o Frecce per muoversi, Spazio per power-up,
              M per gadget, ESC per pausa
            </p>
            <p>
              <strong>Mobile:</strong> Joystick per muoversi, pulsanti overlay per
              power-up e gadget
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-gray-500 text-sm">
          <p>Creato con ❤️ per il divertimento</p>
          {user && (
            <p className="mt-2">
              Benvenuto, <strong>{user.firstName}</strong>!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
