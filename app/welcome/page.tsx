import type { Metadata } from "next";
import WelcomeNav from "./WelcomeNav";

export const metadata: Metadata = {
  title: "Welcome",
};

export default function WelcomePage() {
  return (
    <>
      <WelcomeNav />

      <main className="flex min-h-[calc(100vh-72px)] w-full flex-col items-center justify-center px-6 py-16">
        <h1 className="text-5xl font-bold" style={{ color: "#11273e" }}>
          Hello World
        </h1>
      </main>
    </>
  );
}

