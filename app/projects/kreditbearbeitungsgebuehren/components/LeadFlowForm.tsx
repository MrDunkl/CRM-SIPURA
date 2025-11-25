"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Persona = "private" | "business";
type FlowStep = "persona" | "banks" | "amount" | "borrowers" | "summary";

const personas: Array<{
  id: Persona;
  title: string;
  subtitle: string;
  description: string;
}> = [
  {
    id: "private",
    title: "Als Privatperson",
    subtitle: "Immobilien- und Konsumentenkredite",
    description:
      "Perfekt, wenn du einen Wohnungs- oder Hauskredit aufgenommen hast. Wir prüfen kostenlos, ob deine Bank zu hohe Gebühren verlangt hat.",
  },
  {
    id: "business",
    title: "Als Unternehmen",
    subtitle: "Firmenfinanzierungen & Betriebsmittel",
    description:
      "Geeignet für Unternehmer und Selbstständige. Wir analysieren Verträge und holen unzulässige Gebühren für dich zurück.",
  },
];

const banks = [
  "BAWAG",
  "Bank Austria",
  "Wüstenrot",
  "Erste Bank & Sparkasse",
  "S-Bausparkasse",
  "Volksbank",
  "Raiffeisen",
  "Austrian Anadi Bank",
  "HYPO",
  "Start Bausparkasse",
];

const loanRanges = [
  "unter 100.000 €",
  "100.000 € - 250.000 €",
  "250.000 € - 500.000 €",
  "500.000 € - 1.000.000 €",
  "über 1.000.000 €",
];

const personaHeadline: Record<Persona, string> = {
  private: "Privatkunde · Bank wählen",
  business: "Unternehmen · Bank wählen",
};

export default function LeadFlowForm() {
  const [step, setStep] = useState<FlowStep>("persona");
  const [persona, setPersona] = useState<Persona | null>(null);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null);
  const [borrowerCount, setBorrowerCount] = useState<"single" | "multiple" | null>(null);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canProceedBanks = persona !== null && selectedBanks.length > 0;
  const canProceedAmount = Boolean(selectedAmount);
  const canProceedBorrowers = Boolean(borrowerCount && consentPrivacy && consentTerms);

  const personaCards = useMemo(
    () =>
      personas.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            setPersona(item.id);
            setSubmitted(false);
            setStep("banks");
          }}
          className="flex flex-col gap-4 rounded-3xl bg-white p-8 text-left shadow-[0_20px_65px_-35px_rgba(17,39,62,0.4)] transition hover:-translate-y-2 hover:shadow-[0_26px_75px_-35px_rgba(29,94,219,0.35)]"
          type="button"
        >
          <span className="text-sm font-medium uppercase tracking-[0.28em] text-[#9aa9c8]">
            {item.subtitle}
          </span>
          <h2 className="text-2xl font-semibold text-[#11273e]">{item.title}</h2>
          <p className="text-sm leading-relaxed text-[#3b4a68]">{item.description}</p>
          <span className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-[#1d5edb] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-sm">
            Auswahl treffen
          </span>
        </button>
      )),
    []
  );

  const toggleBank = (bank: string) => {
    setSelectedBanks((prev) =>
      prev.includes(bank) ? prev.filter((entry) => entry !== bank) : [...prev, bank]
    );
  };

  const handleBack = () => {
    if (step === "banks") {
      setPersona(null);
      setSelectedBanks([]);
      setSelectedAmount(null);
      setBorrowerCount(null);
      setConsentPrivacy(false);
      setConsentTerms(false);
      setStep("persona");
    } else if (step === "amount") {
      setSelectedAmount(null);
      setStep("banks");
    } else if (step === "borrowers") {
      setBorrowerCount(null);
      setStep("amount");
    } else if (step === "summary") {
      setStep("borrowers");
      setSubmitted(false);
    }
  };

  const handleProceedBanks = () => {
    if (!canProceedBanks) return;
    setStep("amount");
  };

  const handleProceedAmount = () => {
    if (!canProceedAmount) return;
    setStep("borrowers");
  };

  const handleProceedBorrowers = () => {
    if (!canProceedBorrowers) return;
    setStep("summary");
    setSubmitted(true);
  };

  return (
    <div className="w-full space-y-10">
      {step === "persona" && (
        <div className="grid gap-8 md:grid-cols-2">{personaCards}</div>
      )}

      {step === "banks" && persona && (
        <div className="rounded-[32px] bg-white/95 p-6 shadow-[0_25px_80px_-40px_rgba(17,39,62,0.5)] md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm font-semibold uppercase tracking-[0.32em] text-[#1d5edb]">
              {personaHeadline[persona]}
            </div>
            <button
              type="button"
              onClick={handleBack}
              className="text-sm font-medium text-[#1d5edb] transition hover:text-[#174cbc]"
            >
              Zurück
            </button>
          </div>
          <p className="mt-3 text-2xl font-semibold text-[#11273e]">
            Wähle die Bank, bei der du die Gebühr bezahlt hast.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {banks.map((bank) => {
              const selected = selectedBanks.includes(bank);
              return (
                <button
                  key={bank}
                  type="button"
                  onClick={() => toggleBank(bank)}
                  className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left text-base font-semibold transition ${
                    selected
                      ? "border-[#1d5edb] bg-[#f0f4ff] text-[#11273e] shadow-inner"
                      : "border-[#e5e7eb] bg-white text-[#11273e] hover:border-[#cfe0ff]"
                  }`}
                >
                  <span>{bank}</span>
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      selected ? "border-[#1d5edb] bg-[#1d5edb]" : "border-[#cbd5e1]"
                    }`}
                  >
                    {selected && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={!canProceedBanks}
            onClick={handleProceedBanks}
            className={`mt-6 w-full rounded-2xl px-5 py-3 text-sm font-semibold uppercase tracking-wide transition ${
              canProceedBanks
                ? "bg-[#1d5edb] text-white hover:bg-[#174cbc]"
                : "cursor-not-allowed bg-[#e2e8f5] text-[#94a3b8]"
            }`}
          >
            Weiter
          </button>
        </div>
      )}

      {step === "amount" && (
        <div className="rounded-[32px] bg-white/95 p-6 shadow-[0_25px_80px_-40px_rgba(17,39,62,0.5)] md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm font-semibold uppercase tracking-[0.32em] text-[#1d5edb]">
              Wähle die gewünschte Summe
            </div>
            <button
              type="button"
              onClick={handleBack}
              className="text-sm font-medium text-[#1d5edb] transition hover:text-[#174cbc]"
            >
              Zurück
            </button>
          </div>
          <p className="mt-3 text-2xl font-semibold text-[#11273e]">
            In welcher Größenordnung lag dein Kreditbetrag?
          </p>
          <div className="mt-6 grid gap-4">
            {loanRanges.map((range) => {
              const active = selectedAmount === range;
              return (
                <button
                  key={range}
                  type="button"
                  onClick={() => setSelectedAmount(range)}
                  className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left text-base font-semibold transition ${
                    active
                      ? "border-[#1d5edb] bg-[#f0f4ff] text-[#11273e] shadow-inner"
                      : "border-[#e5e7eb] bg-white text-[#11273e] hover:border-[#cfe0ff]"
                  }`}
                >
                  <span>{range}</span>
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      active ? "border-[#1d5edb] bg-[#1d5edb]" : "border-[#cbd5e1]"
                    }`}
                  >
                    {active && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            disabled={!canProceedAmount}
            onClick={handleProceedAmount}
            className={`mt-6 w-full rounded-2xl px-5 py-3 text-sm font-semibold uppercase tracking-wide transition ${
              canProceedAmount
                ? "bg-[#1d5edb] text-white hover:bg-[#174cbc]"
                : "cursor-not-allowed bg-[#e2e8f5] text-[#94a3b8]"
            }`}
          >
            Weiter
          </button>
        </div>
      )}

      {step === "borrowers" && (
        <div className="rounded-[32px] bg-white/95 p-6 shadow-[0_25px_80px_-40px_rgba(17,39,62,0.5)] md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm font-semibold uppercase tracking-[0.32em] text-[#1d5edb]">
              Wie viele Kreditnehmer gibt es?
            </div>
            <button
              type="button"
              onClick={handleBack}
              className="text-sm font-medium text-[#1d5edb] transition hover:text-[#174cbc]"
            >
              Zurück
            </button>
          </div>
          <p className="mt-3 text-2xl font-semibold text-[#11273e]">
            Bitte wähle, ob du allein oder gemeinsam den Kredit aufgenommen hast.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              { value: "single", label: "Ich bin der Einzige" },
              { value: "multiple", label: "Es gibt mehrere Kreditnehmer" },
            ].map((option) => {
              const active = borrowerCount === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setBorrowerCount(option.value as "single" | "multiple")}
                  className={`flex flex-col items-center gap-3 rounded-3xl border px-5 py-5 text-base font-semibold transition ${
                    active
                      ? "border-[#1d5edb] bg-[#f0f4ff] text-[#1d5edb]"
                      : "border-[#e2e6f2] bg-white text-[#11273e] hover:border-[#cfe0ff]"
                  }`}
                >
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 space-y-3 text-left text-sm text-[#3b4a68]">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={consentPrivacy}
                onChange={(event) => setConsentPrivacy(event.target.checked)}
                className="h-4 w-4 rounded border-[#cfe0ff] text-[#1d5edb] focus:ring-[#1d5edb]"
              />
              <span>
                Ich akzeptiere die{" "}
                <Link href="#" className="underline">
                  Datenschutzbestimmungen
                </Link>{" "}
                und habe die{" "}
                <Link href="#" className="underline">
                  Widerrufsbelehrung
                </Link>{" "}
                gelesen.
              </span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={consentTerms}
                onChange={(event) => setConsentTerms(event.target.checked)}
                className="h-4 w-4 rounded border-[#cfe0ff] text-[#1d5edb] focus:ring-[#1d5edb]"
              />
              <span>
                Ich akzeptiere die{" "}
                <Link href="#" className="underline">
                  Allgemeinen Finanzierungsbedingungen
                </Link>
                .
              </span>
            </label>
          </div>

          <button
            type="button"
            disabled={!canProceedBorrowers}
            onClick={handleProceedBorrowers}
            className={`mt-6 w-full rounded-2xl px-5 py-3 text-sm font-semibold uppercase tracking-wide transition ${
              canProceedBorrowers
                ? "bg-[#1d5edb] text-white hover:bg-[#174cbc]"
                : "cursor-not-allowed bg-[#e2e8f5] text-[#94a3b8]"
            }`}
          >
            Speichern &amp; zurück
          </button>
        </div>
      )}

      {step === "summary" && (
        <div className="rounded-[32px] bg-white/95 p-6 shadow-[0_25px_80px_-40px_rgba(17,39,62,0.5)] md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm font-semibold uppercase tracking-[0.32em] text-[#1d5edb]">
              Zusammenfassung
            </div>
            <button
              type="button"
              onClick={handleBack}
              className="text-sm font-medium text-[#1d5edb] transition hover:text-[#174cbc]"
            >
              Zurück
            </button>
          </div>
          <div className="mt-4 space-y-2 text-left text-sm text-[#3b4a68]">
            <p>
              <strong>Persona:</strong>{" "}
              {persona === "business" ? "Unternehmen" : "Privatkunde"}
            </p>
            <p>
              <strong>Banken:</strong> {selectedBanks.join(", ")}
            </p>
            <p>
              <strong>Kreditsumme:</strong> {selectedAmount ?? "–"}
            </p>
            <p>
              <strong>Kreditnehmer:</strong>{" "}
              {borrowerCount === "multiple" ? "Mehrere Kreditnehmer" : "Ein Kreditnehmer"}
            </p>
          </div>
        </div>
      )}

      {submitted && persona && selectedAmount && borrowerCount && (
        <div className="rounded-3xl bg-[#f7faff] p-6 text-left shadow-inner">
          <h3 className="text-lg font-semibold text-[#11273e]">
            Fast geschafft – Multi Partners kümmert sich um den Rest.
          </h3>
          <p className="mt-2 text-sm text-[#3b4a68]">
            Wir bereiten deinen Anspruch vor. Als Nächstes erhältst du unser kompaktes Formular,
            damit wir die Unterlagen prüfen können. Für Fragen steht dir unser Team jederzeit unter{" "}
            <Link href="mailto:office@multipartners.at" className="text-[#1d5edb] underline">
              office@multipartners.at
            </Link>{" "}
            zur Verfügung.
          </p>
        </div>
      )}
    </div>
  );
}

