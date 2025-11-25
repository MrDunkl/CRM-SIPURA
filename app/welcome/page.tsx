import { useState } from "react";
import type { Metadata } from "next";
import { FiShield } from "react-icons/fi";
import { HiOutlineFolder } from "react-icons/hi";
import { RiBankCardLine, RiMoneyEuroCircleLine } from "react-icons/ri";
import { TbPokerChip } from "react-icons/tb";
import AnimatedHeadline from "./AnimatedHeadline";
import Footer from "./Footer";
import RotatingSolutions from "./RotatingSolutions";
import Testimonials from "./Testimonials";
import WelcomeNav from "./WelcomeNav";

export const metadata: Metadata = {
  title: "Welcome",
};

export default function WelcomePage() {
  const [showExtraProjects, setShowExtraProjects] = useState(false);

  const tiles = [
    {
      title: "Energie & Stromkosten",
      description:
        "Wir analysieren Strom- und Gasabrechnungen, entdecken versteckte Gebühren und setzen Rückforderungen durch.",
      action: "Kosten prüfen lassen",
      icon: FiShield,
      accent: "bg-[#f1f5ff] text-[#1d4ed8]",
      accentHover: "hover:bg-[#dce6ff]",
      onAction: undefined,
    },
    {
      title: "Betriebskosten optimieren",
      description:
        "Wir prüfen die jährlichen Betriebskostenabrechnungen und machen überhöhte Positionen sofort geltend.",
      action: "Einsparung sichern",
      icon: RiBankCardLine,
      accent: "bg-[#fef3c7] text-[#b45309]",
      accentHover: "hover:bg-[#fde68a]",
      onAction: undefined,
    },
    {
      title: "Weitere Projekte",
      description:
        "Du möchtest mehr? Entdecke unsere Unterstützung bei Kreditbearbeitungsgebühren und Casinoverlusten.",
      action: showExtraProjects ? "Zusatzprojekte ausblenden" : "Alle Projekte ansehen",
      icon: HiOutlineFolder,
      accent: "bg-[#e5f3ff] text-[#2563eb]",
      accentHover: "hover:bg-[#cfe6ff]",
      onAction: () => setShowExtraProjects((prev) => !prev),
    },
  ];

  const extraTiles = [
    {
      title: "Kreditbearbeitungsgebühren",
      description:
        "Wir setzen rechtswidrige Gebühren außer Kraft und holen dein Geld zurück – gestützt auf aktuelle Judikatur.",
      action: "Gebühren zurückfordern",
      icon: RiMoneyEuroCircleLine,
      accent: "bg-[#eef2ff] text-[#1d4ed8]",
      accentHover: "hover:bg-[#d7e0ff]",
    },
    {
      title: "Casinoverluste",
      description:
        "Wir prüfen deine Spielverluste bei illegalen Anbietern und begleiten dich bis zur erfolgreichen Rückzahlung.",
      action: "Verlust prüfen lassen",
      icon: TbPokerChip,
      accent: "bg-[#fff1f0] text-[#b91c1c]",
      accentHover: "hover:bg-[#ffe0de]",
    },
  ];

  return (
    <>
      <WelcomeNav />

      <main className="flex min-h-[calc(100vh-120px)] w-full flex-col items-center justify-center gap-16 bg-white px-6 py-20">
        <AnimatedHeadline />
        <div className="grid w-full max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tiles.map(({ title, description, action, icon: Icon, accent, accentHover, onAction }) => (
            <div
              key={title}
              className="relative flex flex-col gap-6 rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-[0_12px_35px_-18px_rgba(15,39,62,0.35)] transition-transform duration-200 hover:-translate-y-2 hover:shadow-[0_18px_40px_-15px_rgba(29,94,219,0.35)]"
            >
              <span
                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-semibold transition-colors duration-300 ${accent} ${accentHover}`}
              >
                <Icon />
              </span>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[#11273e]">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{description}</p>
              </div>
              <button
                type="button"
                onClick={onAction}
                className="mt-auto inline-flex items-center justify-center rounded-2xl bg-[#1d5edb] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#174cbc]"
              >
                {action}
              </button>
            </div>
          ))}
        </div>
        {showExtraProjects && (
          <div className="grid w-full max-w-5xl gap-6 md:grid-cols-2">
            {extraTiles.map(({ title, description, action, icon: Icon, accent, accentHover }) => (
              <div
                key={title}
                className="flex flex-col gap-6 rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-[0_12px_35px_-18px_rgba(15,39,62,0.35)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_16px_35px_-18px_rgba(17,39,62,0.35)]"
              >
                <span
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-semibold transition-colors duration-300 ${accent} ${accentHover}`}
                >
                  <Icon />
                </span>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-[#11273e]">{title}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{description}</p>
                </div>
                <button
                  type="button"
                  className="mt-auto inline-flex items-center justify-center rounded-2xl bg-[#1d5edb] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#174cbc]"
                >
                  {action}
                </button>
              </div>
            ))}
          </div>
        )}
        <RotatingSolutions />
        <Testimonials />
        <Footer />
      </main>
    </>
  );
}

