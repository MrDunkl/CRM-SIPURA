"use client";

import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiChevronLeft, FiChevronRight, FiStar } from "react-icons/fi";

const ROTATE_MS = 6000;

type Testimonial = {
  author: string;
  initials: string;
  quote: string;
  rating: number;
  timestamp: string;
};

const testimonials: Testimonial[] = [
  {
    author: "Ugur Muslu",
    initials: "UM",
    quote: "Fabelhafte Betreuung – transparent, schnell und sehr lösungsorientiert.",
    rating: 5,
    timestamp: "vor 6 Monaten",
  },
  {
    author: "M. K.",
    initials: "MK",
    quote: "Sehr zufrieden mit der Beratung. Alle Fragen wurden direkt geklärt.",
    rating: 5,
    timestamp: "vor 1 Jahr",
  },
  {
    author: "T. Schmid",
    initials: "TS",
    quote: "Professionelles Team, das wirklich übernimmt – klare Empfehlung!",
    rating: 5,
    timestamp: "vor 3 Monaten",
  },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, ROTATE_MS);
    return () => window.clearInterval(interval);
  }, []);

  const current = useMemo(() => testimonials[index], [index]);

  const goNext = () => setIndex((prev) => (prev + 1) % testimonials.length);
  const goPrev = () => setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="w-full rounded-[2.5rem] bg-[#eef3ff] px-6 py-16 shadow-[0_20px_55px_-28px_rgba(17,39,62,0.3)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <header className="space-y-3 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#3b4a68]">
            Unsere Bewertungen
          </p>
          <h2 className="text-3xl font-semibold text-[#11273e] sm:text-4xl">
            Ihr Vertrauen in uns
          </h2>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="relative flex flex-col gap-6 rounded-3xl bg-white px-10 py-12 text-left shadow-[0_18px_40px_-24px_rgba(15,39,62,0.3)]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[#f7b500]">
                {Array.from({ length: current.rating }).map((_, idx) => (
                  <FiStar key={idx} className="text-xl" />
                ))}
              </div>
              <FiCheckCircle className="text-lg text-[#1d5edb]" />
            </div>
            <p className="text-lg font-medium text-[#1d5edb]">{current.quote}</p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#1d5edb] via-[#2563eb] to-[#0f1f3a] text-lg font-semibold text-white shadow-md">
                {current.initials}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[#11273e]">{current.author}</span>
                <span className="text-xs text-gray-500">{current.timestamp}</span>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-y-1/2 left-6 -translate-y-1/2 text-4xl text-[#e0e7ff] lg:pointer-events-auto lg:text-[#c4cffd]">
              <button
                type="button"
                onClick={goPrev}
                className="hidden h-10 w-10 items-center justify-center rounded-full border border-[#d7dffe] bg-white text-sm text-[#2563eb] shadow-sm transition hover:bg-[#f1f4ff] lg:flex"
                aria-label="Vorherige Bewertung"
              >
                <FiChevronLeft />
              </button>
            </div>
            <div className="pointer-events-none absolute inset-y-1/2 right-6 -translate-y-1/2 text-4xl text-[#e0e7ff] lg:pointer-events-auto lg:text-[#c4cffd]">
              <button
                type="button"
                onClick={goNext}
                className="hidden h-10 w-10 items-center justify-center rounded-full border border-[#d7dffe] bg-white text-sm text-[#2563eb] shadow-sm transition hover:bg-[#f1f4ff] lg:flex"
                aria-label="Nächste Bewertung"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>

          <div className="hidden lg:flex lg:flex-col lg:gap-6">
            {testimonials.map((item, idx) => (
              <button
                key={item.author}
                onClick={() => setIndex(idx)}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                  idx === index
                    ? "border-[#1d5edb] bg-white text-[#11273e] shadow-sm"
                    : "border-transparent bg-transparent text-[#3b4a68] hover:border-[#cfe0ff]"
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1d5edb]/10 text-sm font-semibold text-[#1d5edb]">
                  {item.initials}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{item.author}</span>
                  <span className="text-xs text-gray-500">{item.timestamp}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

