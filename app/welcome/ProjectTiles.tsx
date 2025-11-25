"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FiShield } from "react-icons/fi";
import { HiOutlineFolder } from "react-icons/hi";
import { RiBankCardLine, RiMoneyEuroCircleLine } from "react-icons/ri";
import { TbPokerChip } from "react-icons/tb";

interface TileData {
  title: string;
  description: string;
  action: string;
  icon: React.ComponentType;
  accent: string;
  accentHover: string;
  onClick?: () => void;
  href?: string;
}

export default function ProjectTiles() {
  const [showExtras, setShowExtras] = useState(false);

  const baseTiles = useMemo<TileData[]>(
    () => [
      {
        title: "Energie & Stromkosten",
        description:
          "Wir analysieren Strom- und Gasabrechnungen, entdecken versteckte Gebühren und setzen Rückforderungen durch.",
        action: "Kosten prüfen lassen",
        icon: FiShield,
        accent: "bg-[#f1f5ff] text-[#1d4ed8]",
        accentHover: "hover:bg-[#dce6ff]",
      },
      {
        title: "Betriebskosten optimieren",
        description:
          "Wir prüfen die jährlichen Betriebskostenabrechnungen und machen überhöhte Positionen sofort geltend.",
        action: "Einsparung sichern",
        icon: RiBankCardLine,
        accent: "bg-[#fef3c7] text-[#b45309]",
        accentHover: "hover:bg-[#fde68a]",
      },
      {
        title: "Weitere Projekte",
        description:
          "Du möchtest mehr? Entdecke unsere Unterstützung bei Kreditbearbeitungsgebühren und Casinoverlusten.",
        action: showExtras ? "Zusatzprojekte ausblenden" : "Alle Projekte ansehen",
        icon: HiOutlineFolder,
        accent: "bg-[#e5f3ff] text-[#2563eb]",
        accentHover: "hover:bg-[#cfe6ff]",
        onClick: () => setShowExtras((prev) => !prev),
      },
    ],
    [showExtras]
  );

  const extraTiles: TileData[] = [
    {
      title: "Kreditbearbeitungsgebühren",
      description:
        "Wir setzen rechtswidrige Gebühren außer Kraft und holen dein Geld zurück – gestützt auf aktuelle Judikatur.",
      action: "Gebühren zurückfordern",
      icon: RiMoneyEuroCircleLine,
      accent: "bg-[#eef2ff] text-[#1d4ed8]",
      accentHover: "hover:bg-[#d7e0ff]",
      href: "/projects/kreditbearbeitungsgebuehren",
    },
    {
      title: "Casinoverluste",
      description:
        "Wir prüfen deine Spielverluste bei illegalen Anbietern und begleiten dich bis zur erfolgreichen Rückzahlung.",
      action: "Verlust prüfen lassen",
      icon: TbPokerChip,
      accent: "bg-[#fff1f0] text-[#b91c1c]",
      accentHover: "hover:bg-[#ffe0de]",
      href: "/projects/casinoverluste",
    },
  ];

  const renderTile = (tile: TileData) => {
    const Icon = tile.icon;
    const Action = tile.href ? (
      <Link
        href={tile.href}
        className="mt-auto inline-flex items-center justify-center rounded-2xl bg-[#1d5edb] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#174cbc]"
      >
        {tile.action}
      </Link>
    ) : (
      <button
        type="button"
        onClick={tile.onClick}
        className="mt-auto inline-flex items-center justify-center rounded-2xl bg-[#1d5edb] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#174cbc]"
      >
        {tile.action}
      </button>
    );

    return (
      <div
        key={tile.title}
        className="relative flex flex-col gap-6 rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-[0_12px_35px_-18px_rgba(15,39,62,0.35)] transition-transform duration-200 hover:-translate-y-2 hover:shadow-[0_18px_40px_-15px_rgba(29,94,219,0.35)]"
      >
        <span
          className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-semibold transition-colors duration-300 ${tile.accent} ${tile.accentHover}`}
        >
          <Icon />
        </span>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-[#11273e]">{tile.title}</h3>
          <p className="text-sm leading-relaxed text-gray-600">{tile.description}</p>
        </div>
        {Action}
      </div>
    );
  };

  return (
    <>
      <div className="grid w-full max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
        {baseTiles.map(renderTile)}
      </div>
      {showExtras && (
        <div className="grid w-full max-w-5xl gap-6 md:grid-cols-2">
          {extraTiles.map(renderTile)}
        </div>
      )}
    </>
  );
}

