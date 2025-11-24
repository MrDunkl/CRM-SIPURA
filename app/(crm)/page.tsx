"use client";

import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [lastValue, setLastValue] = useState<number | null>(null);

  const handleClick = async () => {
    setLoading(true);

    const randomValue = Math.floor(Math.random() * 1000);
    setLastValue(randomValue);

    try {
      const response = await fetch("/api/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: randomValue }),
      });

      if (!response.ok) {
        console.error("Fehler beim Senden des Werts");
      }
    } catch (error) {
      console.error("Fehler:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={handleClick}
          disabled={loading}
          className="bg-[#89CFF0] hover:bg-[#6FB8DC] text-white font-semibold py-4 px-8 rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
        >
          {loading ? "Sende..." : "Zufallswert senden"}
        </button>

        {lastValue !== null && (
          <div className="text-gray-600 text-sm">
            Letzter Wert:{" "}
            <span className="font-bold" style={{ color: "#89CFF0" }}>
              {lastValue}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
