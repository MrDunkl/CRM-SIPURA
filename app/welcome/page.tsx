import type { Metadata } from "next";
import AnimatedHeadline from "./AnimatedHeadline";
import Footer from "./Footer";
import ProjectTiles from "./ProjectTiles";
import RotatingSolutions from "./RotatingSolutions";
import Testimonials from "./Testimonials";
import WelcomeNav from "./WelcomeNav";

export const metadata: Metadata = {
  title: "Welcome",
};

export default function WelcomePage() {
  return (
    <>
      <WelcomeNav />

      <main className="flex min-h-[calc(100vh-120px)] w-full flex-col items-center justify-center gap-16 bg-white px-6 py-20">
        <AnimatedHeadline />
        <ProjectTiles />
        <RotatingSolutions />
        <Testimonials />
        <Footer />
      </main>
    </>
  );
}

