import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome",
};

export default function WelcomePage() {
  return (
    <>
      <header className="flex w-full items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10">
            <Image
              src="/images/multipartners-logo.png"
              alt="Multi Partners GmbH"
              width={40}
              height={40}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <span className="text-sm font-semibold tracking-wide text-gray-700 uppercase">
            Multi Partners GmbH
          </span>
        </div>
        <nav className="flex items-center gap-6 text-sm font-semibold text-gray-700">
          <button type="button" className="rounded-full px-3 py-1 transition hover:text-[#11273e]">
            Unsere Projekte
          </button>
          <button type="button" className="rounded-full px-3 py-1 transition hover:text-[#11273e]">
            Kontakt
          </button>
          <button type="button" className="rounded-full px-3 py-1 transition hover:text-[#11273e]">
            Team
          </button>
        </nav>
      </header>

      <main className="flex min-h-[calc(100vh-72px)] w-full flex-col items-center justify-center px-6 py-16">
        <h1 className="text-5xl font-bold" style={{ color: "#11273e" }}>
          Hello World
        </h1>
      </main>
    </>
  );
}

