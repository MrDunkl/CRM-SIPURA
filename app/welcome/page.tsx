import type { Metadata } from "next";
import WelcomeNav from "./WelcomeNav";
import AnimatedHeadline from "./AnimatedHeadline";

export const metadata: Metadata = {
  title: "Welcome",
};

export default function WelcomePage() {
  const highlights = [
    {
      title: "Online-Casinoverluste",
      description:
        "Wir holen verlorene Einsätze zurück und begleiten dich durch den gesamten Prozess.",
    },
    {
      title: "Betriebskosten optimieren",
      description:
        "Wir überprüfen deine laufenden Kosten und identifizieren sofortige Einsparpotenziale.",
    },
    {
      title: "Kreditbearbeitungsgebühren",
      description:
        "Wir sorgen dafür, dass unzulässige Gebühren zurückerstattet werden – schnell und zuverlässig.",
    },
  ];

  return (
    <>
      <WelcomeNav />

      <main className="flex min-h-[calc(100vh-80px)] flex-col items-center gap-12 bg-white px-6 py-16">
        <div className="flex w-full max-w-4xl flex-col items-center gap-6 text-center">
          <AnimatedHeadline />
          <p className="max-w-2xl text-sm text-gray-600 md:text-base">
            Ob Privatperson oder Unternehmen – wir stehen an deiner Seite. Mit einem erfahrenen Team,
            datengestützten Analysen und klaren Prozessen schaffen wir nachhaltige Lösungen.
          </p>
        </div>

        <div className="grid w-full max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-3 rounded-2xl border border-[#e5edff] bg-[#f8faff] p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-[#11273e]">{item.title}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

