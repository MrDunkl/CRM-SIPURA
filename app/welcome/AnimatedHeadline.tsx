"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const FADE_DURATION_MS = 220;

export default function AnimatedHeadline() {
  const words = useMemo(() => ["finanzieren", "kaufen", "lösen"], []);
  const [index, setIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setIsFading(true);
      fadeTimeoutRef.current = window.setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        setIsFading(false);
      }, FADE_DURATION_MS);
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
      if (fadeTimeoutRef.current) {
        window.clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, [words.length]);

  return (
    <h1 className="text-center text-4xl font-semibold text-[#11273e] md:text-5xl lg:text-6xl">
      Wir{" "}
      <span
        className={`text-[#1d5edb] transition-opacity duration-200 ${
          isFading ? "opacity-0" : "opacity-100"
        }`}
      >
        {words[index]}
      </span>{" "}
      Ihr Problem.
    </h1>
  );
}

