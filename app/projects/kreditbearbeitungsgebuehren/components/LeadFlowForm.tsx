"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Persona = "private" | "business";
type FlowStep =
  | "persona"
  | "banks"
  | "amount"
  | "borrowers"
  | "contact"
  | "summary";

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

const borrowerOptions: Array<{ value: "single" | "multiple"; label: string }> = [
  { value: "single", label: "Ich bin der Einzige" },
  { value: "multiple", label: "Es gibt mehrere Kreditnehmer" },
];

const personaHeadline: Record<Persona, string> = {
  private: "Privatkunde · Bank wählen",
  business: "Unternehmen · Bank wählen",
};

const DEFAULT_ADMIN_ID = process.env.NEXT_PUBLIC_CAMPAIGN_ADMIN_ID ?? "";

export default function LeadFlowForm() {
  const [step, setStep] = useState<FlowStep>("persona");
  const [persona, setPersona] = useState<Persona | null>(null);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null);
  const [borrowerCount, setBorrowerCount] = useState<"single" | "multiple" | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canProceedBanks = persona !== null && selectedBanks.length > 0;
  const canProceedAmount = Boolean(selectedAmount);
  const canProceedBorrowers = Boolean(borrowerCount);
  const canProceedContact =
    Boolean(contactName.trim() && contactPhone.trim() && contactEmail.trim()) &&
    consentPrivacy &&
    consentTerms;

  const personaCards = useMemo(
    () =>
      personas.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => {
            setPersona(item.id);
            setSubmitted(false);
            setStep("banks");
          }}
          className="flex flex-col gap-4 rounded-3xl bg-white p-8 text-left shadow-[0_20px_65px_-35px_rgba(17,39,62,0.4)] transition hover:-translate-y-2 hover:shadow-[0_26px_75px_-35px_rgba(29,94,219,0.35)]"
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

  const resetContact = () => {
    setContactName("");
    setContactPhone("");
    setContactEmail("");
    setConsentPrivacy(false);
    setConsentTerms(false);
    setSubmitError(null);
    setIsSubmitting(false);
  };

  const handleBack = () => {
    if (step === "banks") {
      setPersona(null);
      setSelectedBanks([]);
      setSelectedAmount(null);
      setBorrowerCount(null);
      resetContact();
      setStep("persona");
    } else if (step === "amount") {
      setSelectedAmount(null);
      setStep("banks");
    } else if (step === "borrowers") {
      setBorrowerCount(null);
      setStep("amount");
    } else if (step === "contact") {
      resetContact();
      setStep("borrowers");
    } else if (step === "summary") {
      setStep("contact");
      setSubmitted(false);
    }
  };

  const handleProceedBanks = () => {
    if (canProceedBanks) setStep("amount");
  };

  const handleProceedAmount = () => {
    if (canProceedAmount) setStep("borrowers");
  };

  const handleProceedBorrowers = () => {
    if (canProceedBorrowers) setStep("contact");
  };

  const handleProceedContact = async () => {
    if (!canProceedContact || !persona || !selectedAmount || !borrowerCount) return;

    if (!DEFAULT_ADMIN_ID) {
      setSubmitError(
        "Kein verantwortlicher Admin konfiguriert. Bitte NEXT_PUBLIC_CAMPAIGN_ADMIN_ID setzen."
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const sourceUrl =
        typeof window !== "undefined" ? window.location.href : undefined;
      const response = await fetch("/api/campaign/kreditbearbeitungs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: DEFAULT_ADMIN_ID,
          persona,
          selectedBanks,
          loanAmountRange: selectedAmount,
          borrowerCount,
          contactName,
          contactPhone,
          contactEmail,
          consentPrivacy,
          consentTerms,
          metadata: { source_url: sourceUrl },
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : "Lead konnte nicht gespeichert werden."
        );
      }

      setLeadId(typeof payload?.leadId === "string" ? payload.leadId : null);
      setStep("summary");
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unbekannter Fehler.");
    } finally {
      setIsSubmitting(false);
    }
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
            {borrowerOptions.map((option) => {
              const active = borrowerCount === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setBorrowerCount(option.value)}
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
            Weiter
          </button>
        </div>
      )}

      {step === "contact" && (
        <div className="rounded-[32px] bg-white/95 p-6 shadow-[0_25px_80px_-40px_rgba(17,39,62,0.5)] md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm font-semibold uppercase tracking-[0.32em] text-[#1d5edb]">
              Letzter Schritt
            </div>
            <button
              type="button"
              onClick={handleBack}
              className="text-sm font-medium text-[#1d5edb] transition hover:text-[#174cbc]"
            >
              Zurück
            </button>
          </div>

          <div className="mt-4 space-y-2 text-center">
            <span className="inline-flex items-center justify-center rounded-full bg-[#34d399]/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-[#0f5132]">
              Geschafft! Letzter Schritt ✓
            </span>
            <p className="text-xs text-[#3b4a68]/70">
              Wir können nur qualifizierte Anfragen beantworten. Bitte hinterlasse uns daher deine
              Kontaktdaten.
            </p>
            <h2 className="text-3xl font-semibold text-[#11273e]">
              Wie können wir dich am besten erreichen?
            </h2>
          </div>

          <form className="mt-6 space-y-4">
            <label className="block text-left">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#9aa9c8]">
                Dein vollständiger Name
              </span>
              <input
                type="text"
                value={contactName}
                onChange={(event) => setContactName(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-[#dbe3f5] bg-[#f9fbff] px-4 py-3 text-sm text-[#11273e] shadow-sm focus:border-[#1d5edb] focus:outline-none focus:ring-2 focus:ring-[#1d5edb]/30"
                placeholder="Max Mustermann"
              />
            </label>
            <label className="block text-left">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#9aa9c8]">
                Telefonnummer
              </span>
              <input
                type="tel"
                value={contactPhone}
                onChange={(event) => setContactPhone(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-[#dbe3f5] bg-[#f9fbff] px-4 py-3 text-sm text-[#11273e] shadow-sm focus:border-[#1d5edb] focus:outline-none focus:ring-2 focus:ring-[#1d5edb]/30"
                placeholder="+43 660 1234567"
              />
            </label>
            <label className="block text-left">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#9aa9c8]">
                E-Mail-Adresse
              </span>
              <input
                type="email"
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-[#dbe3f5] bg-[#f9fbff] px-4 py-3 text-sm text-[#11273e] shadow-sm focus:border-[#1d5edb] focus:outline-none focus:ring-2 focus:ring-[#1d5edb]/30"
                placeholder="name@beispiel.at"
              />
            </label>

            <div className="space-y-3 pt-2 text-left text-sm text-[#3b4a68]">
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
          </form>

          {submitError && (
            <div className="mt-4 rounded-2xl border border-[#facc15] bg-[#fffbeb] px-4 py-3 text-sm text-[#92400e]">
              {submitError}
            </div>
          )}

          <button
            type="button"
            disabled={!canProceedContact || isSubmitting}
            onClick={handleProceedContact}
            className={`mt-8 w-full rounded-2xl px-5 py-3 text-sm font-semibold uppercase tracking-wide transition ${
              canProceedContact && !isSubmitting
                ? "bg-[#1d5edb] text-white hover:bg-[#174cbc]"
                : "cursor-not-allowed bg-[#e2e8f5] text-[#94a3b8]"
            }`}
          >
            {isSubmitting ? "Wird gesendet …" : "Anfrage abschicken!"}
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
              <strong>Kreditsumme:</strong> {selectedAmount}
            </p>
            <p>
              <strong>Kreditnehmer:</strong>{" "}
              {borrowerCount === "multiple" ? "Mehrere Kreditnehmer" : "Ein Kreditnehmer"}
            </p>
            <p>
              <strong>Kontakt:</strong> {contactName} · {contactPhone} · {contactEmail}
            </p>
            {leadId && (
              <p>
                <strong>Lead-ID:</strong> {leadId}
              </p>
            )}
          </div>
          <div className="mt-6 rounded-2xl bg-[#f7faff] px-5 py-4 text-sm text-[#3b4a68]">
            Danke für dein Vertrauen! Unser Team meldet sich innerhalb eines Werktags. Du kannst
            uns jederzeit unter{" "}
            <Link href="mailto:office@multipartners.at" className="text-[#1d5edb] underline">
              office@multipartners.at
            </Link>{" "}
            erreichen.
          </div>
        </div>
      )}

      {submitted && (
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

