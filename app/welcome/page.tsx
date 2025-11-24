import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome",
};

export default function WelcomePage() {
  return (
    <div className="flex min-h-[80vh] w-full items-center justify-center">
      <h1 className="text-4xl font-bold" style={{ color: "#11273e" }}>
        Hello World
      </h1>
    </div>
  );
}

