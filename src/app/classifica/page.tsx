"use client";

import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  level: number;
  image?: string;
}

export default function ClassificaPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"mondiale" | "locale">("mondiale");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Carica classifica mondiale
  useEffect(() => {
    if (activeTab === "mondiale") {
      setLoading(true);
      // TODO: Implementare API call per classifica mondiale
      setTimeout(() => {
        setLeaderboard([
          { rank: 1, name: "Giocatore1", score: 5000, level: 5 },
          { rank: 2, name: "Giocatore2", score: 4500, level: 4 },
          { rank: 3, name: "Giocatore3", score: 4000, level: 4 },
          { rank: 4, name: "Giocatore4", score: 3500, level: 3 },
          { rank: 5, name: "Giocatore5", score: 3000, level: 3 },
        ]);
        setLoading(false);
      }, 500);
    }
  }, [activeTab]);

  // Carica classifica locale (Clerk user data)
  useEffect(() => {
    if (activeTab === "locale" && user) {
      const localScore = localStorage.getItem(`score_${user.id}`);
      const localLevel = localStorage.getItem(`level_${user.id}`);

      setLeaderboard([
        {
          rank: 1,
          name: user.fullName || "Tu",
          score: parseInt(localScore || "0"),
          level: parseInt(localLevel || "0"),
          image: user.imageUrl,
        },
      ]);
    }
  }, [activeTab, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Classifica</h1>

        <SignedOut>
          <div className="text-center py-12">
            <p className="text-white text-xl mb-4">
              Accedi per visualizzare la classifica
            </p>
            <SignInButton mode="modal" />
          </div>
        </SignedOut>

        <SignedIn>
          <div className="flex gap-4 mb-8">
            <Button
              onClick={() => setActiveTab("mondiale")}
              className={`px-6 py-2 font-bold ${
                activeTab === "mondiale"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Mondiale
            </Button>
            <Button
              onClick={() => setActiveTab("locale")}
              className={`px-6 py-2 font-bold ${
                activeTab === "locale"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Locale
            </Button>
          </div>

          {loading ? (
            <div className="text-center text-white">Caricamento...</div>
          ) : (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Classifica {activeTab === "mondiale" ? "Mondiale" : "Locale"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.rank}
                      className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-yellow-400 font-bold text-xl w-8">
                          #{entry.rank}
                        </div>
                        {entry.image && (
                          <img
                            src={entry.image}
                            alt={entry.name}
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <div>
                          <div className="text-white font-bold">
                            {entry.name}
                          </div>
                          <div className="text-gray-400 text-sm">
                            Livello {entry.level}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold text-xl">
                          {entry.score}
                        </div>
                        <div className="text-gray-400 text-sm">punti</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </SignedIn>
      </div>
    </div>
  );
}
