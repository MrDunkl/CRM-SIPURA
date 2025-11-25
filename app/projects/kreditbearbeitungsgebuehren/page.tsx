import Link from "next/link";

const personaCards = [
  {
    title: "Als Privatperson",
    description:
      "Ideal für Immobilien- oder Konsumentenkredite. Wir prüfen kostenlos, ob deine Bank zu hohe Bearbeitungsgebühren verrechnet hat.",
    href: "/lead", // adjust to actual funnel target
  },
  {
    title: "Als Unternehmen",
    description:
      "Für Unternehmerkredite und Firmenfinanzierungen. Wir analysieren Verträge, dokumentieren Gebühren und holen das Geld zurück.",
    href: "/lead",
  },
];

export default function KreditbearbeitungsgebuehrenPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f8ff] to-[#ecf2ff] text-[#11273e]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <div className="text-2xl font-semibold text-[#1d5edb]">Multi Partners</div>
        <Link
          href="/welcome"
          className="rounded-full border border-[#cfe0ff] px-4 py-2 text-sm font-semibold text-[#1d5edb] transition hover:bg-[#e0eaff]"
        >
          Zurück zur Übersicht
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 pb-20 text-center">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.4em] text-[#1d5edb]">
            Bearbeitungsgebühren
          </p>
          <h1 className="text-4xl font-semibold md:text-5xl">
            Bearbeitungsgebühren sind rückforderbar.
          </h1>
          <p className="text-lg text-[#3b4a68]">
            Du hast bei deiner Bank eine Bearbeitungsgebühr gezahlt? Wir prüfen deinen Anspruch
            kostenlos und setzen ihn durch – transparent, schnell und rechtssicher.
          </p>
        </div>

        <section className="grid gap-8 md:grid-cols-2">
          {personaCards.map((card) => (
            <div
              key={card.title}
              className="flex flex-col gap-4 rounded-3xl bg-white p-8 text-left shadow-[0_20px_60px_-25px_rgba(17,39,62,0.3)] transition hover:-translate-y-2 hover:shadow-[0_26px_70px_-30px_rgba(29,94,219,0.35)]"
            >
              <span className="text-sm font-medium uppercase tracking-[0.3em] text-[#9aa9c8]">
                Option
              </span>
              <h2 className="text-2xl font-semibold text-[#11273e]">{card.title}</h2>
              <p className="text-sm leading-relaxed text-[#3b4a68]">{card.description}</p>
              <Link
                href={card.href}
                className="mt-auto inline-flex items-center justify-center rounded-2xl bg-[#1d5edb] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#174cbc]"
              >
                Schritt starten
              </Link>
            </div>
          ))}
        </section>

        <section className="rounded-3xl bg-white/70 p-8 text-left shadow-inner">
          <h3 className="text-xl font-semibold text-[#11273e]">Wie läuft die Prüfung ab?</h3>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#3b4a68]">
            <li>1. Formular ausfüllen – wir benötigen nur wenige Angaben zu deinem Kredit.</li>
            <li>2. Unsere Experten analysieren Verträge und Aufstellungen deiner Bank.</li>
            <li>
              3. Wir übernehmen Verhandlungen & Rückforderung – du erhältst dein Geld ohne
              Prozesskostenrisiko zurück.
            </li>
          </ul>
          <p className="mt-6 text-xs text-[#6b7a99]">
            Hinweis: Dieser Service richtet sich an Kreditnehmer in Österreich. Für andere Länder
            bitte direkt mit unserem Team Kontakt aufnehmen.
          </p>
        </section>
      </main>
    </div>
  );
}

