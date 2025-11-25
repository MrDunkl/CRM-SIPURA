import type { Metadata } from "next";
import { FiShield } from "react-icons/fi";
import { HiOutlineFolder } from "react-icons/hi";
import { RiBankCardLine } from "react-icons/ri";
import AnimatedHeadline from "./AnimatedHeadline";
import RotatingSolutions from "./RotatingSolutions";
import Testimonials from "./Testimonials";
import WelcomeNav from "./WelcomeNav";

export const metadata: Metadata = {
  title: "Welcome",
};

export default function WelcomePage() {
  const tiles = [
    {
      title: "Casinoverluste zurückholen",
      description:
        "Wir prüfen deinen Fall und kämpfen für die Rückzahlung deiner Spieleinsätze bei illegalen Anbietern.",
      action: "Verluste prüfen lassen",
      icon: FiShield,
      accent: "bg-[#fcefc7] text-[#b45309]",
      accentHover: "hover:bg-[#fbd38d]",
    },
    {
      title: "Kreditbearbeitungsgebühren",
      description:
        "Wir fordern unzulässige Gebühren effizient zurück – basierend auf aktueller OGH-Rechtsprechung.",
      action: "Gebühren anfechten",
      icon: RiBankCardLine,
      accent: "bg-[#e0edff] text-[#1d4ed8]",
      accentHover: "hover:bg-[#c7dbff]",
    },
    {
      title: "Weitere Projekte",
      description:
        "Erhalte eine Übersicht über alle laufenden und kommenden Projekte aus unserem Netzwerk.",
      action: "Alle Projekte ansehen",
      icon: HiOutlineFolder,
      accent: "bg-[#e5f3ff] text-[#2563eb]",
      accentHover: "hover:bg-[#cfe6ff]",
    },
  ];

  return (
    <>
      <WelcomeNav />

      <main className="flex min-h-[calc(100vh-120px)] w-full flex-col items-center justify-center gap-16 bg-white px-6 py-20">
        <AnimatedHeadline />
        <div className="grid w-full max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tiles.map(({ title, description, action, icon: Icon, accent, accentHover }) => (
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
                className="mt-auto inline-flex items-center justify-center rounded-2xl bg-[#1d5edb] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#174cbc]"
              >
                {action}
              </button>
            </div>
          ))}
        </div>
        <RotatingSolutions />
        <Testimonials />
      </main>
    </>
  );
}

