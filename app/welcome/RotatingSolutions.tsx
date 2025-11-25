"use client";

import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { FiRefreshCw, FiTarget } from "react-icons/fi";
import { RiShakeHandsLine } from "react-icons/ri";

const SWITCH_INTERVAL = 6000;
const FADE_MS = 250;

type Solution = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

const solutions: Solution[] = [
  {
    title: "Forderungskauf",
    description:
      "Multi Partners übernimmt deinen Anspruch und überweist dir den vereinbarten Kaufpreis – schnell und unabhängig vom Prozessausgang.",
    icon: RiShakeHandsLine,
  },
  {
    title: "Prozessfinanzierung",
    description:
      "Wir tragen das volle Kostenrisiko, koordinieren Anwälte und halten dich transparent über jeden Schritt am Laufenden.",
    icon: FiTarget,
  },
  {
    title: "Strategische Beratung",
    description:
      "Gemeinsam definieren wir den besten Weg zum Erfolg, optimieren Unterlagen und nutzen unser Netzwerk für passgenaue Lösungen.",
    icon: FiRefreshCw,
  },
];

export default function RotatingSolutions() {
  const [index, setIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const fadeTimeout = useRef<ReturnType<typeof setTimeout>>();

  const current = useMemo(() => solutions[index], [index]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setIsFading(true);
      fadeTimeout.current = window.setTimeout(() => {
        setIndex((prev) => (prev + 1) % solutions.length);
        setIsFading(false);
      }, FADE_MS);
    }, SWITCH_INTERVAL);

    return () => {
      window.clearInterval(intervalId);
      if (fadeTimeout.current) {
        window.clearTimeout(fadeTimeout.current);
      }
    };
  }, []);

  const Icon = current.icon;

  return (
    <section className="w-full rounded-[2.5rem] bg-[#ecf2ff] px-6 py-16 shadow-[0_18px_48px_-20px_rgba(17,39,62,0.25)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 text-center">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#3b4a68]">
            Möglichkeiten der Kostenübernahme
          </p>
          <h2 className="text-3xl font-semibold text-[#11273e] sm:text-4xl">
            Multi Partners – Sie haben die Wahl.
          </h2>
        </div>

        <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-6 rounded-[2rem] bg-white px-10 py-16 text-center shadow-[0_20px_50px_-24px_rgba(15,39,62,0.35)] transition-all duration-300">
          <span
            className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1d5edb]/10 text-3xl text-[#1d5edb] transition-opacity duration-200 ${
              isFading ? "opacity-0" : "opacity-100"
            }`}
          >
            <Icon />
          </span>
          <div className={`space-y-4 transition-opacity duration-200 ${isFading ? "opacity-0" : "opacity-100"}`}>
            <h3 className="text-2xl font-semibold text-[#1d5edb]">{current.title}</h3>
            <p className="text-base leading-relaxed text-[#3b4a68]">{current.description}</p>
          </div>
          <div className="absolute left-8 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#d0dcff] text-[#a4b4e6] lg:flex">
            <span className="text-lg">‹</span>
          </div>
          <div className="absolute right-8 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#d0dcff] text-[#a4b4e6] lg:flex">
            <span className="text-lg">›</span>
          </div>
        </div>
      </div>
    </section>
  );
}

