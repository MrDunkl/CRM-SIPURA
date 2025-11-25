import type { Metadata } from "next";
import AnimatedHeadline from "./AnimatedHeadline";
import WelcomeNav from "./WelcomeNav";

export const metadata: Metadata = {
  title: "Welcome",
};

export default function WelcomePage() {
  return (
    <>
      <WelcomeNav />

      <main className="flex min-h-[calc(100vh-120px)] w-full flex-col items-center justify-center bg-white px-6 py-20">
        <AnimatedHeadline />
      </main>
    </>
  );
}

