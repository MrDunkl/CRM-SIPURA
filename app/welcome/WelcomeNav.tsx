"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { IoIosArrowDown } from "react-icons/io";

const projectLinks = [
  "Online-Casinoverluste",
  "Altbaumiete senken",
  "Kreditbearbeitungsgebühr",
  "Weitere Projekte",
];

export default function WelcomeNav() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <header className="flex w-full items-center justify-between border-b border-gray-200 bg-[#fcfbf7] px-8 py-4">
      <div className="flex items-center gap-4">
        <div className="h-32 w-32">
          <Image
            src="/images/multipartners-logo.png"
            alt="Multi Partners GmbH"
            width={256}
            height={256}
            className="h-full w-full object-contain"
            priority
          />
        </div>
      </div>

      <nav className="flex items-center gap-8 text-sm font-semibold text-[#1c1c1c]">
        <div ref={dropdownRef} className="group relative flex flex-col items-center">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className={`flex cursor-pointer items-center gap-2 pb-2 transition-colors ${
              open ? "text-[#11273e]" : "hover:text-[#11273e]"
            }`}
          >
            <span>Unsere Projekte</span>
            <IoIosArrowDown className={`text-lg transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
          <span className={`h-[2px] w-20 bg-[#1d5edb] transition-opacity duration-200 ${open ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`} />
          {open && (
            <div className="absolute top-full z-10 mt-1 w-64 rounded-lg border border-gray-200 bg-white py-4 shadow-lg">
              <ul className="flex flex-col gap-3 px-6 text-sm text-[#1c1c1c]">
                {projectLinks.map((label) => (
                  <li key={label} className="cursor-pointer font-medium hover:text-[#11273e]">
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <a
          href="#kontakt"
          className="pb-2 text-sm font-semibold text-[#1c1c1c] transition-colors hover:text-[#11273e]"
        >
          Kontakt
        </a>
      </nav>
    </header>
  );
}

