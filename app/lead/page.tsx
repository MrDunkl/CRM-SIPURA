"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type MouseEventHandler,
} from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";

type Step =
  | "leadType"
  | "bestandsOverview"
  | "leadForm"
  | "customerType"
  | "bankSelection"
  | "loanAmount"
  | "borrowerCount";

type LeadType = "bestands" | "neu";
type CustomerType = "unternehmen" | "privat";
type LeadIdentifier = string | number;

type LeadDocumentLink = {
  id: string;
  provider: string;
  reference?: string;
  url?: string;
  fallbackUrl?: string;
  created_at?: string | null;
  notes?: string;
};

type LeadDocumentGroup = {
  energie: LeadDocumentLink[];
  betriebskosten: LeadDocumentLink[];
  casino: LeadDocumentLink[];
};

type ResetStateOptions = { keepLeadContext?: boolean };

type ExistingLead = {
  id: LeadIdentifier;
  lead_type: LeadType | string | null;
  employee_id?: string | null;
  created_at?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  nationality?: string | null;
  birth_date?: string | null;
  employment_status?: string | null;
  consent_privacy?: boolean;
  consent_conditions?: boolean;
  kredit?: {
    customer_type?: CustomerType | null;
    selected_banks?: string[] | null;
    loan_amount_range?: string | null;
    borrower_count?: "single" | "multiple" | null;
  } | null;
  documents?: LeadDocumentGroup;
};

const categoryTabs = [
  { id: "kredit", label: "Kreditgebühren" },
  { id: "energie", label: "Energie" },
  { id: "betrieb", label: "Betriebskosten" },
  { id: "casino", label: "Casino-Verluste" },
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

const loanAmounts = [
  "unter 100.000 €",
  "100.000 € - 250.000 €",
  "250.000 € - 500.000 €",
  "500.000 € - 1.000.000 €",
  "über 1.000.000 €",
];

const employmentOptions = ["Angestellt", "Mitarbeiter", "Selbständig", "Arbeitslos"];

const casinoVendors = [
  "BWIN",
  "Partycasino / Partypoker",
  "Tipico",
  "bet 365",
  "Casinoclub",
  "Sportingbet",
  "LuckyDays",
  "Interwetten",
  "Stake",
];

export default function LeadPage() {
  const router = useRouter();
  const { session } = useSessionContext();
  const employeeId = session?.user?.id ?? null;
  const isAuthenticated = Boolean(employeeId);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [step, setStep] = useState<Step>("leadType");
  const [selectedLeadType, setSelectedLeadType] = useState<LeadType | null>(null);
  const [selectedCustomerType, setSelectedCustomerType] = useState<CustomerType | null>(null);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [selectedLoanAmount, setSelectedLoanAmount] = useState<string | null>(null);
  const [selectedBorrowerCount, setSelectedBorrowerCount] = useState<"single" | "multiple" | null>(
    null
  );
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptConditions, setAcceptConditions] = useState(false);
  const [employmentStatus, setEmploymentStatus] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [bestandsLeads, setBestandsLeads] = useState<ExistingLead[]>([]);
  const [activeLeadId, setActiveLeadId] = useState<LeadIdentifier | null>(null);
  const [isLoadingBestands, setIsLoadingBestands] = useState(false);
  const [leadListError, setLeadListError] = useState<string | null>(null);
  const [currentLeadId, setCurrentLeadId] = useState<LeadIdentifier | null>(null);

  // Energie-Formular
  const [energyProvider, setEnergyProvider] = useState("");
  const [energyCustomerNumber, setEnergyCustomerNumber] = useState("");
  const [energyDocument, setEnergyDocument] = useState<File | null>(null);
  const [energyPrivacy, setEnergyPrivacy] = useState(false);
  const [energyConditions, setEnergyConditions] = useState(false);
  const [isEnergySubmitting, setIsEnergySubmitting] = useState(false);

  // Betriebskosten-Formular
  const [operationProvider, setOperationProvider] = useState("");
  const [operationDurationValue, setOperationDurationValue] = useState("");
  const [operationDurationUnit, setOperationDurationUnit] = useState<"monate" | "jahre">("monate");
  const [operationNotes, setOperationNotes] = useState("");
  const [operationDocument, setOperationDocument] = useState<File | null>(null);
  const [operationPrivacy, setOperationPrivacy] = useState(false);
  const [operationConditions, setOperationConditions] = useState(false);
  const [isOperationSubmitting, setIsOperationSubmitting] = useState(false);

  // Casino-Verluste Formular
  const [selectedCasinoProviders, setSelectedCasinoProviders] = useState<string[]>([]);
  const [casinoAmount, setCasinoAmount] = useState("");
  const [casinoNotes, setCasinoNotes] = useState("");
  const [casinoPrivacy, setCasinoPrivacy] = useState(false);
  const [casinoConditions, setCasinoConditions] = useState(false);
  const [isCasinoSubmitting, setIsCasinoSubmitting] = useState(false);
const [casinoDocument, setCasinoDocument] = useState<File | null>(null);

  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nationality: "",
    birthDate: "",
  });

  const resetLeadState = (options?: ResetStateOptions) => {
    setStep("leadType");
    setSelectedLeadType(null);
    setSelectedCustomerType(null);
    setSelectedBanks([]);
    setSelectedLoanAmount(null);
    setSelectedBorrowerCount(null);
    setAcceptPrivacy(false);
    setAcceptConditions(false);
    setEmploymentStatus("");
    setFormValues({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      nationality: "",
      birthDate: "",
    });
    setEnergyProvider("");
    setEnergyCustomerNumber("");
    setEnergyDocument(null);
    setEnergyPrivacy(false);
    setEnergyConditions(false);
    setOperationProvider("");
    setOperationDurationValue("");
    setOperationDurationUnit("monate");
    setOperationNotes("");
    setOperationDocument(null);
    setOperationPrivacy(false);
    setOperationConditions(false);
    setSelectedCasinoProviders([]);
    setCasinoAmount("");
    setCasinoNotes("");
    setCasinoPrivacy(false);
    setCasinoConditions(false);
    setCasinoDocument(null);
    setSelectedCasinoProviders([]);
    setCasinoPrivacy(false);
    setCasinoConditions(false);
    setBestandsLeads([]);
    setActiveLeadId(null);
    setLeadListError(null);
    setIsLoadingBestands(false);
    if (!options?.keepLeadContext) {
      setCurrentLeadId(null);
    }
  };

  const handleResetAllClick: MouseEventHandler<HTMLButtonElement> = () => {
    resetLeadState();
  };

  const toggleBank = (bank: string) => {
    setSelectedBanks((prev) =>
      prev.includes(bank) ? prev.filter((b) => b !== bank) : [...prev, bank]
    );
  };

  const handleEnergySubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (
      !energyProvider ||
      !energyCustomerNumber ||
      !energyDocument ||
      !energyPrivacy ||
      !energyConditions
    ) {
      return;
    }
    if (!currentLeadId) {
      setToast({
        message: "Bitte zuerst einen Lead speichern.",
        type: "error",
      });
      return;
    }

    try {
      setIsEnergySubmitting(true);
      const formData = new FormData();
      formData.append("provider", energyProvider);
      formData.append("customerNumber", energyCustomerNumber);
      formData.append("document", energyDocument);
      formData.append("leadId", String(currentLeadId));

      const response = await fetch("/api/energy", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Supabase energy upload failed");
      }

      setToast({ message: "Energie-Daten gespeichert!", type: "success" });
      setEnergyProvider("");
      setEnergyCustomerNumber("");
      setEnergyDocument(null);
      setEnergyPrivacy(false);
      setEnergyConditions(false);
      setCategoryIndex((prev) => Math.min(prev + 1, categoryTabs.length - 1));
    } catch (error) {
      console.error(error);
      setToast({
        message: "Speichern der Energie-Daten fehlgeschlagen. Bitte erneut versuchen.",
        type: "error",
      });
    } finally {
      setIsEnergySubmitting(false);
    }
  };

  const handleOperationSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (
      !operationProvider ||
      !operationDurationValue ||
      !operationDocument ||
      !operationPrivacy ||
      !operationConditions
    ) {
      return;
    }
    if (!currentLeadId) {
      setToast({
        message: "Bitte zuerst einen Lead speichern.",
        type: "error",
      });
      return;
    }

    try {
      setIsOperationSubmitting(true);
      const formData = new FormData();
      formData.append("provider", operationProvider);
      formData.append("durationValue", operationDurationValue);
      formData.append("durationUnit", operationDurationUnit);
      formData.append("notes", operationNotes);
      formData.append("document", operationDocument);
      formData.append("leadId", String(currentLeadId));

      const response = await fetch("/api/betriebskosten", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Supabase operation upload failed");
      }

      setToast({ message: "Betriebskosten gespeichert!", type: "success" });
      setOperationProvider("");
      setOperationDurationValue("");
      setOperationDurationUnit("monate");
      setOperationNotes("");
      setOperationDocument(null);
      setOperationPrivacy(false);
      setOperationConditions(false);
      setCategoryIndex((prev) => Math.min(prev + 1, categoryTabs.length - 1));
    } catch (error) {
      console.error(error);
      setToast({
        message: "Speichern der Betriebskosten fehlgeschlagen. Bitte erneut versuchen.",
        type: "error",
      });
    } finally {
      setIsOperationSubmitting(false);
    }
  };

  const handleCasinoProviderToggle = (provider: string) => {
    setSelectedCasinoProviders((prev) =>
      prev.includes(provider) ? prev.filter((p) => p !== provider) : [...prev, provider]
    );
  };

  const normalizeAmount = (value: string) =>
    Number(value.replace(/\./g, "").replace(",", ".").trim());

  const formatDateOnly = (value?: string | null) => {
    if (!value) return "—";
    try {
      return new Intl.DateTimeFormat("de-AT", { dateStyle: "medium" }).format(new Date(value));
    } catch {
      return value;
    }
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return "—";
    try {
      return new Intl.DateTimeFormat("de-AT", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value));
    } catch {
      return value;
    }
  };

  const formatLeadTypeLabel = (value?: ExistingLead["lead_type"]) => {
    if (!value) return "Lead";
    const normalized = `${value}`.toLowerCase();
    if (normalized.startsWith("best")) return "Bestands Lead";
    if (normalized.startsWith("neu")) return "Neuer Lead";
    return `${value}`;
  };

  const fetchBestandsLeads = useCallback(async () => {
    if (!employeeId) return;
    setIsLoadingBestands(true);
    setLeadListError(null);
    try {
      const response = await fetch(`/api/leads?employeeId=${employeeId}`);
      if (!response.ok) {
        throw new Error("Leads konnten nicht geladen werden.");
      }
      const payload = (await response.json()) as { leads?: ExistingLead[] };
      const leads = payload.leads ?? [];
      setBestandsLeads(leads);
      setActiveLeadId((prev) => {
        if (prev && leads.some((lead) => lead.id === prev)) {
          return prev;
        }
        return leads[0]?.id ?? null;
      });
    } catch (error) {
      setLeadListError(
        error instanceof Error ? error.message : "Unbekannter Fehler beim Laden."
      );
      setBestandsLeads([]);
      setActiveLeadId(null);
    } finally {
      setIsLoadingBestands(false);
    }
  }, [employeeId]);

  const handleCasinoSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const normalizedAmount = normalizeAmount(casinoAmount);
    if (
      !selectedCasinoProviders.length ||
      !casinoAmount.trim() ||
      Number.isNaN(normalizedAmount) ||
      normalizedAmount <= 0 ||
      !casinoPrivacy ||
      !casinoConditions ||
      !casinoDocument
    ) {
      return;
    }
    if (!currentLeadId) {
      setToast({
        message: "Bitte zuerst einen Lead speichern.",
        type: "error",
      });
      return;
    }

    try {
      setIsCasinoSubmitting(true);
      const formData = new FormData();
      formData.append("providers", JSON.stringify(selectedCasinoProviders));
      formData.append("amount", String(normalizedAmount));
      formData.append("notes", casinoNotes);
      formData.append("consentPrivacy", String(casinoPrivacy));
      formData.append("consentConditions", String(casinoConditions));
      formData.append("leadId", String(currentLeadId));
      formData.append("document", casinoDocument);

      const response = await fetch("/api/casino", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Casino upload failed");
      }

      setToast({ message: "Casino-Verluste erfasst!", type: "success" });
      resetLeadState();
      setCategoryIndex(0);
      router.push("/");
    } catch (error) {
      console.error(error);
      setToast({
        message: "Speichern der Casino-Verluste fehlgeschlagen.",
        type: "error",
      });
    } finally {
      setIsCasinoSubmitting(false);
    }
  };

  const handleInputChange =
    (field: keyof typeof formValues) => (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (categoryIndex !== 0 || step !== "bestandsOverview" || !employeeId) return;
    void fetchBestandsLeads();
  }, [categoryIndex, step, fetchBestandsLeads, employeeId]);

  const leadPayload = useMemo(
    () => ({
      lead_type: selectedLeadType,
      first_name: formValues.firstName,
      last_name: formValues.lastName,
      email: formValues.email,
      phone: formValues.phone,
      nationality: formValues.nationality,
      birth_date: formValues.birthDate || null,
      employment_status: employmentStatus || null,
      consent_privacy: acceptPrivacy,
      consent_conditions: acceptConditions,
      employee_id: employeeId,
    }),
    [
      selectedLeadType,
      formValues.firstName,
      formValues.lastName,
      formValues.email,
      formValues.phone,
      formValues.nationality,
      formValues.birthDate,
      employmentStatus,
      acceptPrivacy,
      acceptConditions,
      employeeId,
    ]
  );

  const kreditPayload = useMemo(
    () => ({
      customer_type: selectedCustomerType,
      selected_banks: selectedBanks,
      loan_amount_range: selectedLoanAmount,
      borrower_count: selectedBorrowerCount,
    }),
    [selectedCustomerType, selectedBanks, selectedLoanAmount, selectedBorrowerCount]
  );

  const normalizedCasinoAmount = normalizeAmount(casinoAmount);
  const isCasinoAmountValid =
    casinoAmount.trim().length > 0 &&
    !Number.isNaN(normalizedCasinoAmount) &&
    normalizedCasinoAmount > 0;

  const isLeadFormValid =
    leadPayload.first_name &&
    leadPayload.last_name &&
    leadPayload.email &&
    employmentStatus &&
    selectedLeadType;

  const activeLead = useMemo(
    () => bestandsLeads.find((lead) => lead.id === activeLeadId) ?? null,
    [bestandsLeads, activeLeadId]
  );

const activeLeadDocuments = activeLead?.documents ?? { energie: [], betriebskosten: [], casino: [] };
  const showStepper = !(categoryIndex === 0 && step === "bestandsOverview");

  const renderDocumentSection = (title: string, docs: LeadDocumentLink[]) => {
    const hasDocs = docs.length > 0;
    return (
      <div className="rounded-2xl border border-gray-100 bg-[#f7f8fc] p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4 flex-wrap text-sm">
          <p className="font-semibold text-gray-900">{title}</p>
          <span className="text-xs text-gray-500">
            {hasDocs ? `${docs.length} Datei${docs.length === 1 ? "" : "en"}` : "Keine Dateien"}
          </span>
        </div>
        {!hasDocs ? (
          <p className="text-sm text-gray-500">Keine Dokumente vorhanden.</p>
        ) : (
          <div className="space-y-2">
            {docs.map((doc) => {
              const href = doc.url || doc.fallbackUrl || "";
              const isDisabled = !href;
              return (
                <a
                  key={doc.id}
                  href={isDisabled ? undefined : href}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${
                    isDisabled
                      ? "cursor-not-allowed border-dashed border-gray-300 text-gray-400"
                      : "border-white bg-white text-gray-900 shadow-sm hover:border-[#2563EB] hover:text-[#2563EB]"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">{doc.provider}</span>
                    {(doc.reference || doc.created_at) && (
                      <span className="text-xs text-gray-500">
                        {doc.reference ?? ""}
                        {doc.reference && doc.created_at ? " · " : ""}
                        {doc.created_at ? formatDateTime(doc.created_at) : ""}
                      </span>
                    )}
                    {doc.notes && <span className="text-xs text-gray-500">{doc.notes}</span>}
                  </div>
                  {!isDisabled && (
                    <span className="text-xs font-semibold text-[#2563EB]">Download</span>
                  )}
                </a>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderLeadMissingNotice = () => (
    <div
      className="mt-6 w-full max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center space-y-4 text-amber-900"
    >
      <p className="text-sm font-medium">
        Bitte zuerst unter „Kreditgebühren“ einen Lead speichern, bevor Dokumente hochgeladen werden.
      </p>
      <button
        onClick={() => {
          setCategoryIndex(0);
          setStep("leadType");
        }}
        className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#1D4ED8]"
      >
        Zurück zum Lead-Formular
      </button>
    </div>
  );

  const handleFinish = async () => {
    if (!employeeId) {
      setToast({
        message: "Bitte zuerst im Mitarbeiterbereich einloggen.",
        type: "error",
      });
      return;
    }
    if (!(selectedBorrowerCount && acceptPrivacy && acceptConditions)) return;
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadData: leadPayload,
          kreditData: kreditPayload,
        }),
      });

      if (!response.ok) {
        throw new Error("Supabase upload failed");
      }
      const result = (await response.json()) as { leadId?: LeadIdentifier };
      if (!result?.leadId) {
        throw new Error("Lead-ID fehlt in der Antwort.");
      }

      setToast({ message: "Lead erfolgreich gespeichert!", type: "success" });
      setCurrentLeadId(result.leadId);
      const nextIndex = Math.min(categoryIndex + 1, categoryTabs.length - 1);
      setCategoryIndex(nextIndex);
      resetLeadState({ keepLeadContext: true });
    } catch (error) {
      console.error(error);
      setToast({ message: "Speichern fehlgeschlagen. Bitte erneut versuchen.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6 text-center"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        <div className="max-w-md rounded-3xl border border-dashed border-gray-300 bg-white/90 p-8 shadow-2xl">
          <p className="text-xs uppercase tracking-wide text-gray-400">Zugriff erforderlich</p>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">Bitte zuerst anmelden</h1>
          <p className="mt-3 text-sm text-gray-600">
            Nutze den farbigen Kreis in der rechten Sidebar, um dich mit deiner Mitarbeiter-ID und
            deinem Passwort einzuloggen. Danach stehen dir alle Lead-Funktionen zur Verfügung.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative z-40"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div className="flex flex-col items-center gap-6 text-center relative w-full max-w-screen-2xl mx-auto px-2 sm:px-4">
        {showStepper && (
          <div className="w-full max-w-2xl">
            <div className="flex items-center justify-between gap-3">
              {categoryTabs.map((tab, idx) => {
                const active = idx === categoryIndex;
                return (
                  <div key={tab.id} className="flex items-center gap-3 flex-1 justify-center">
                    <button
                      onClick={() => setCategoryIndex(idx)}
                      className={`flex flex-col items-center gap-2 transition-transform ${
                        idx <= categoryIndex ? "hover:scale-105" : "cursor-not-allowed opacity-60"
                      }`}
                      disabled={idx > categoryIndex}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border-2 ${
                          active ? "bg-[#2563EB] border-[#2563EB]" : "border-gray-300"
                        }`}
                      />
                      <span
                        className={`text-xs font-medium ${
                          active ? "text-[#2563EB]" : "text-gray-400"
                        }`}
                      >
                        {tab.label}
                      </span>
                    </button>
                    {idx < categoryTabs.length - 1 && (
                      <span className="hidden sm:block flex-1 h-[2px] bg-gray-200" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {categoryIndex === 0 && step === "leadType" && (
          <>
            <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  setSelectedLeadType("bestands");
                  setStep("bestandsOverview");
                }}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-colors"
              >
                Bestands Leads
              </button>
              <button
                onClick={() => {
                  setSelectedLeadType("neu");
                  setStep("leadForm");
                }}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-colors"
              >
                Neuer Lead
              </button>
            </div>
          </>
        )}

        {categoryIndex === 0 && step === "bestandsOverview" && (
          <div
            className="mt-6 w-full max-w-screen-2xl rounded-2xl shadow-2xl p-6 space-y-6 text-left"
            style={{ backgroundColor: "#fafafc" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Bestands Leads</h2>
                <p className="text-sm text-gray-500">
                  Persönliche Daten links auswählen, um rechts alle Details und Dokumente zu sehen.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (!isLoadingBestands) {
                      void fetchBestandsLeads();
                    }
                  }}
                  disabled={isLoadingBestands}
                  className="rounded-lg border border-[#2563EB] px-4 py-2 text-sm font-medium text-[#2563EB] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoadingBestands ? "Aktualisiere..." : "Aktualisieren"}
                </button>
                <button
                  onClick={handleResetAllClick}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white"
                >
                  Zurück
                </button>
              </div>
            </div>

            {leadListError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
                <p className="text-sm text-red-600">{leadListError}</p>
                <button
                  onClick={() => void fetchBestandsLeads()}
                  className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#1D4ED8]"
                >
                  Erneut versuchen
                </button>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[320px_1fr] items-start">
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {isLoadingBestands ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <div
                        key={`skeleton-${idx}`}
                        className="h-20 rounded-2xl bg-white/70 shadow-inner animate-pulse"
                      />
                    ))
                  ) : !bestandsLeads.length ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-6 text-center text-sm text-gray-500">
                      Keine Leads vorhanden.
                    </div>
                  ) : (
                    bestandsLeads.map((lead) => {
                      const active = lead.id === activeLeadId;
                      return (
                        <button
                          type="button"
                          key={lead.id}
                          onClick={() => setActiveLeadId(lead.id)}
                          className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                            active
                              ? "border-[#2563EB] bg-white shadow-md"
                              : "border-transparent bg-white/70 hover:border-[#2563EB]/40"
                          }`}
                        >
                          <p className="text-sm font-semibold text-gray-900">
                            {lead.first_name} {lead.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{lead.email}</p>
                          <p className="text-xs text-gray-500">{lead.phone}</p>
                          <div className="mt-2 flex items-center justify-between text-[11px] uppercase tracking-wide text-gray-400">
                            <span>{formatLeadTypeLabel(lead.lead_type)}</span>
                            <span>{formatDateTime(lead.created_at)}</span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="flex flex-col gap-6">
                  {activeLead ? (
                    <>
                      <div className="rounded-2xl bg-white p-6 shadow-xl">
                        <div className="space-y-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-400">
                            {formatDateTime(activeLead.created_at)}
                          </p>
                          <h3 className="text-2xl font-semibold text-gray-900">
                            {activeLead.first_name} {activeLead.last_name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {activeLead.email} · {activeLead.phone}
                          </p>
                        </div>
                        <span className="rounded-full bg-[#2563EB]/10 px-3 py-1 text-xs font-semibold uppercase text-[#2563EB]">
                          {formatLeadTypeLabel(activeLead.lead_type)}
                        </span>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl bg-[#f7f8fc] p-4">
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            Staatsangehörigkeit
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {activeLead.nationality || "—"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-[#f7f8fc] p-4">
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            Geburtsdatum
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatDateOnly(activeLead.birth_date)}
                          </p>
                        </div>
                        <div className="rounded-xl bg-[#f7f8fc] p-4">
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            Beschäftigung
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {activeLead.employment_status || "—"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-[#f7f8fc] p-4">
                          <p className="text-xs uppercase tracking-wide text-gray-500">Status</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {activeLead.consent_privacy && activeLead.consent_conditions
                              ? "Einwilligungen erteilt"
                              : "Einwilligungen offen"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900">Kreditdetails</h4>
                        {activeLead.kredit ? (
                          <dl className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <dt className="text-xs uppercase tracking-wide text-gray-500">
                                Kundentyp
                              </dt>
                              <dd className="text-sm text-gray-900">
                                {activeLead.kredit.customer_type === "unternehmen"
                                  ? "Unternehmen"
                                  : "Privatkunde"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs uppercase tracking-wide text-gray-500">
                                Kreditrahmen
                              </dt>
                              <dd className="text-sm text-gray-900">
                                {activeLead.kredit.loan_amount_range || "—"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs uppercase tracking-wide text-gray-500">
                                Banken
                              </dt>
                              <dd className="text-sm text-gray-900">
                                {activeLead.kredit.selected_banks?.length
                                  ? activeLead.kredit.selected_banks.join(", ")
                                  : "—"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs uppercase tracking-wide text-gray-500">
                                Kreditnehmer
                              </dt>
                              <dd className="text-sm text-gray-900">
                                {activeLead.kredit.borrower_count === "multiple"
                                  ? "Mehrere Kreditnehmer"
                                  : activeLead.kredit.borrower_count === "single"
                                    ? "Ein Kreditnehmer"
                                    : "—"}
                              </dd>
                            </div>
                          </dl>
                        ) : (
                          <p className="text-sm text-gray-500">
                            Für diesen Lead wurden noch keine Kreditdetails hinterlegt.
                          </p>
                        )}
                      </div>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white p-6 shadow-xl">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <h4 className="text-sm font-semibold text-gray-900">Dokumente</h4>
                            <span className="text-xs uppercase tracking-wide text-gray-400">
                              Gesamt:{" "}
                              {activeLeadDocuments.energie.length +
                                activeLeadDocuments.betriebskosten.length +
                                activeLeadDocuments.casino.length}{" "}
                              Dateien
                            </span>
                          </div>
                          <div className="space-y-4">
                            {renderDocumentSection("Energie", activeLeadDocuments.energie)}
                            {renderDocumentSection(
                              "Betriebskosten",
                              activeLeadDocuments.betriebskosten
                            )}
                            {renderDocumentSection("Casino-Verluste", activeLeadDocuments.casino)}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl bg-white p-6 shadow-xl flex h-full items-center justify-center text-sm text-gray-500">
                      Wähle links einen Lead aus, um die Detailansicht zu öffnen.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {categoryIndex === 0 && step === "leadForm" && (
          <div
            className="mt-6 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-4 text-left"
            style={{ backgroundColor: "#fafafc" }}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                {selectedLeadType === "bestands" ? "Bestands Lead" : "Neuer Lead"} · Allgemeine Informationen
              </h2>
              <button
                onClick={handleResetAllClick}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Schließen
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600">Vorname</label>
                <input
                  type="text"
                  value={formValues.firstName}
                  onChange={handleInputChange("firstName")}
                  className="rounded-lg border border-[#2563EB] px-3 py-2 text-sm text-[#2563EB] placeholder:text-[#2563EB]/60 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600">Nachname</label>
                <input
                  type="text"
                  value={formValues.lastName}
                  onChange={handleInputChange("lastName")}
                  className="rounded-lg border border-[#2563EB] px-3 py-2 text-sm text-[#2563EB] placeholder:text-[#2563EB]/60 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">E-Mail</label>
              <input
                type="email"
                value={formValues.email}
                onChange={handleInputChange("email")}
                className="rounded-lg border border-[#2563EB] px-3 py-2 text-sm text-[#2563EB] placeholder:text-[#2563EB]/60 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Telefonnummer</label>
              <input
                type="tel"
                value={formValues.phone}
                onChange={handleInputChange("phone")}
                className="rounded-lg border border-[#2563EB] px-3 py-2 text-sm text-[#2563EB] placeholder:text-[#2563EB]/60 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600">Staatsangehörigkeit</label>
                <input
                  type="text"
                  value={formValues.nationality}
                  onChange={handleInputChange("nationality")}
                  className="rounded-lg border border-[#2563EB] px-3 py-2 text-sm text-[#2563EB] placeholder:text-[#2563EB]/60 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600">Geburtsdatum</label>
                <input
                  type="date"
                  value={formValues.birthDate}
                  onChange={handleInputChange("birthDate")}
                  className="rounded-lg border border-[#2563EB] px-3 py-2 text-sm text-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-600">Beschäftigungsstatus</label>
              <div className="grid grid-cols-2 gap-2">
                {employmentOptions.map((status) => {
                  const active = employmentStatus === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setEmploymentStatus(status)}
                      className={`px-3 py-2 rounded-lg border font-medium transition-colors ${
                        active
                          ? "bg-[#2563EB] text-white border-[#2563EB]"
                          : "bg-white text-[#2563EB] border-[#2563EB]"
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => isLeadFormValid && setStep("customerType")}
                className={`w-full font-semibold py-3 rounded-lg shadow transition-shadow ${
                  isLeadFormValid
                    ? "bg-white text-[#2563EB] hover:shadow-md"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                disabled={!isLeadFormValid}
              >
                Weiter
              </button>
            </div>
          </div>
        )}

        {categoryIndex === 0 && step === "customerType" && (
          <div
            className="mt-6 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-6 text-left"
            style={{ backgroundColor: "#fafafc" }}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Kundentyp auswählen</h2>
              <button
                onClick={() => setStep("leadForm")}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Zurück
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Unternehmen", value: "unternehmen" },
                { label: "Privatkunde", value: "privat" },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    setSelectedCustomerType(type.value as CustomerType);
                    setStep("bankSelection");
                  }}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-colors"
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {categoryIndex === 0 && step === "bankSelection" && (
          <div
            className="mt-6 w-full max-w-4xl rounded-2xl shadow-2xl p-6 space-y-6 text-left"
            style={{ backgroundColor: "#fafafc" }}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                {selectedCustomerType === "unternehmen" ? "Unternehmen" : "Privatkunde"} · Bank wählen
              </h2>
              <button
                onClick={() => setStep("customerType")}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Zurück
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banks.map((bank) => (
                <label
                  key={bank}
                  className={`flex items-center justify-between text-xl font-semibold text-gray-900 bg-white rounded-2xl px-5 py-4 border ${
                    selectedBanks.includes(bank) ? "border-[#2563EB]" : "border-gray-200"
                  } shadow-sm hover:shadow-lg transition-all cursor-pointer`}
                  onClick={() => toggleBank(bank)}
                >
                  <span>{bank}</span>
                  <input
                    type="checkbox"
                    name="bank"
                    value={bank}
                    checked={selectedBanks.includes(bank)}
                    onChange={() => toggleBank(bank)}
                    className="accent-[#2563EB] w-5 h-5"
                  />
                </label>
              ))}
            </div>
            <div className="pt-2">
              <button
                onClick={() => selectedBanks.length && setStep("loanAmount")}
                className={`w-full font-semibold py-3 rounded-lg shadow transition-shadow ${
                  selectedBanks.length
                    ? "bg-white text-[#2563EB] hover:shadow-md"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                disabled={!selectedBanks.length}
              >
                Weiter
              </button>
            </div>
          </div>
        )}

        {categoryIndex === 0 && step === "loanAmount" && (
          <div
            className="mt-6 w-full max-w-3xl rounded-2xl shadow-2xl p-6 space-y-6 text-left"
            style={{ backgroundColor: "#fafafc" }}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Wähle die gewünschte Summe</h2>
              <button
                onClick={() => setStep("bankSelection")}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Zurück
              </button>
            </div>
            <div className="space-y-3">
              {loanAmounts.map((amount) => (
                <label
                  key={amount}
                  className={`flex items-center justify-between text-lg font-semibold text-gray-900 bg-white rounded-2xl px-4 py-3 border ${
                    selectedLoanAmount === amount ? "border-[#2563EB]" : "border-gray-200"
                  } shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={() => setSelectedLoanAmount(amount)}
                >
                  <span>{amount}</span>
                  <input
                    type="radio"
                    name="loanAmount"
                    value={amount}
                    checked={selectedLoanAmount === amount}
                    onChange={() => setSelectedLoanAmount(amount)}
                    className="accent-[#2563EB] w-5 h-5"
                  />
                </label>
              ))}
            </div>
            <div className="pt-2">
              <button
                onClick={() => selectedLoanAmount && setStep("borrowerCount")}
                className={`w-full font-semibold py-3 rounded-lg shadow transition-shadow ${
                  selectedLoanAmount
                    ? "bg-white text-[#2563EB] hover:shadow-md"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                disabled={!selectedLoanAmount}
              >
                Weiter
              </button>
            </div>
          </div>
        )}

        {categoryIndex === 0 && step === "borrowerCount" && (
          <div
            className="mt-6 w-full max-w-3xl rounded-2xl shadow-2xl p-6 space-y-6 text-center"
            style={{ backgroundColor: "#fafafc" }}
          >
            <h2 className="text-2xl font-semibold text-gray-900">
              Wie viele Kreditnehmer gibt es?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Ich bin der Einzige", value: "single", icon: "👤" },
                { label: "Es gibt mehrere Kreditnehmer", value: "multiple", icon: "👥" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedBorrowerCount(option.value as "single" | "multiple")}
                  className={`flex flex-col items-center rounded-[32px] overflow-hidden shadow-md border transition-transform ${
                    selectedBorrowerCount === option.value ? "border-[#2563EB]" : "border-transparent"
                  }`}
                >
                  <div className="w-full bg-[#f0f2ff] py-6 text-4xl">{option.icon}</div>
                  <div className="w-full bg-[#2563EB] py-4 text-white font-semibold">
                    {option.label}
                  </div>
                </button>
              ))}
            </div>
            <div className="space-y-4 text-left text-sm sm:text-base text-gray-900">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="accent-[#2563EB] mt-1 w-5 h-5 rounded-md border border-gray-300"
                  checked={acceptPrivacy}
                  onChange={(e) => setAcceptPrivacy(e.target.checked)}
                />
                <span>
                  Ich akzeptiere die {""}
                  <a href="#" className="underline">
                    Datenschutzbestimmungen
                  </a>
                  , und die {""}
                  <a href="#" className="underline">
                    Widerrufsbelehrung
                  </a>{" "}
                  gelesen.
                </span>
              </label>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="accent-[#2563EB] mt-1 w-5 h-5 rounded-md border border-gray-300"
                  checked={acceptConditions}
                  onChange={(e) => setAcceptConditions(e.target.checked)}
                />
                <span>
                  Ich akzeptiere die {""}
                  <a href="#" className="underline">
                    Allgemeinen Finanzierungsbedingungen
                  </a>
                  .
                </span>
              </label>
            </div>
            <div className="pt-2">
              <button
                className={`w-full font-semibold py-3 rounded-lg shadow transition-shadow ${
                  selectedBorrowerCount && acceptPrivacy && acceptConditions
                    ? "bg-white text-[#2563EB] hover:shadow-md"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                onClick={handleFinish}
                disabled={
                  isSubmitting || !(selectedBorrowerCount && acceptPrivacy && acceptConditions)
                }
              >
                {isSubmitting ? "Speichere..." : "Speichern & zurück"}
              </button>
            </div>
          </div>
        )}

        {categoryIndex === 1 && (
          currentLeadId ? (
          <form
            onSubmit={handleEnergySubmit}
            className="mt-6 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-4 text-left"
            style={{ backgroundColor: "#fafafc" }}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                Energie · Lieferdaten
              </h2>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Stromanbieter</label>
              <input
                type="text"
                value={energyProvider}
                onChange={(e) => setEnergyProvider(e.target.value)}
                className="rounded-lg border border-[#2563EB] px-3 py-2 text-sm text-[#2563EB] placeholder:text-[#2563EB]/60 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Kundennummer</label>
              <input
                type="text"
                value={energyCustomerNumber}
                onChange={(e) => setEnergyCustomerNumber(e.target.value)}
                className="rounded-lg border border-[#2563EB] px-3 py-2 text-sm text-[#2563EB] placeholder:text-[#2563EB]/60 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Foto (Rechnung / Nachweis)</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setEnergyDocument(e.target.files?.[0] ?? null)}
                className="rounded-lg border border-dashed border-[#2563EB] px-3 py-2 text-sm text-[#2563EB]"
              />
              {energyDocument && (
                <p className="text-xs text-gray-500">
                  {energyDocument.name} · {(energyDocument.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>

            <div className="space-y-3 text-sm text-gray-900">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="accent-[#2563EB] mt-1 w-5 h-5 rounded-md border border-gray-300"
                  checked={energyPrivacy}
                  onChange={(e) => setEnergyPrivacy(e.target.checked)}
                />
                <span>
                  Ich akzeptiere die{" "}
                  <a href="#" className="underline">
                    Datenschutzbestimmungen
                  </a>{" "}
                  für den Energie-Bereich.
                </span>
              </label>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="accent-[#2563EB] mt-1 w-5 h-5 rounded-md border border-gray-300"
                  checked={energyConditions}
                  onChange={(e) => setEnergyConditions(e.target.checked)}
                />
                <span>
                  Ich akzeptiere die{" "}
                  <a href="#" className="underline">
                    Allgemeinen Finanzierungsbedingungen
                  </a>{" "}
                  für Energie.
                </span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className={`w-full font-semibold py-3 rounded-lg shadow transition-shadow ${
                  energyProvider &&
                  energyCustomerNumber &&
                  energyDocument &&
                  energyPrivacy &&
                  energyConditions
                    ? "bg-white text-[#2563EB] hover:shadow-md"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                disabled={
                  isEnergySubmitting ||
                  !energyProvider ||
                  !energyCustomerNumber ||
                  !energyDocument ||
                  !energyPrivacy ||
                  !energyConditions
                }
              >
                {isEnergySubmitting ? "Speichere..." : "Weiter"}
              </button>
            </div>
          </form>
          ) : (
            renderLeadMissingNotice()
          )
        )}

        {categoryIndex === 2 && (
          currentLeadId ? (
          <form
            onSubmit={handleOperationSubmit}
            className="mt-6 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-4 text-left"
            style={{ backgroundColor: "#fafafc" }}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Betriebskosten · Lieferdaten</h2>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Vermieter</label>
              <input
                type="text"
                value={operationProvider}
                onChange={(e) => setOperationProvider(e.target.value)}
                className="rounded-lg border border-[#2563EB] px-3 py-2 text-sm text-[#2563EB] placeholder:text-[#2563EB]/60 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Laufzeit</label>
              <div className="grid grid-cols-[1fr_auto] gap-3">
                <input
                  type="number"
                  min="0"
                  value={operationDurationValue}
                  onChange={(e) => setOperationDurationValue(e.target.value)}
                  className="rounded-lg border border-[#2563EB] px-3 py-2 text-sm text-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
                <div className="flex rounded-lg border border-[#2563EB] overflow-hidden">
                  {(["monate", "jahre"] as const).map((unit) => {
                    const active = operationDurationUnit === unit;
                    return (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => setOperationDurationUnit(unit)}
                        className={`px-3 py-2 text-sm font-medium transition-colors ${
                          active ? "bg-[#2563EB] text-white" : "bg-white text-[#2563EB]"
                        }`}
                      >
                        {unit === "monate" ? "Monate" : "Jahre"}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Notizen</label>
              <textarea
                rows={4}
                value={operationNotes}
                onChange={(e) => setOperationNotes(e.target.value)}
                className="rounded-lg border border-[#2563EB] px-3 py-2 text-sm text-[#2563EB] placeholder:text-[#2563EB]/60 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Dokument (Mietvertrag / Nachweis)</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setOperationDocument(e.target.files?.[0] ?? null)}
                className="rounded-lg border border-dashed border-[#2563EB] px-3 py-2 text-sm text-[#2563EB]"
              />
              {operationDocument && (
                <p className="text-xs text-gray-500">
                  {operationDocument.name} · {(operationDocument.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>

            <div className="space-y-3 text-sm text-gray-900">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="accent-[#2563EB] mt-1 w-5 h-5 rounded-md border border-gray-300"
                  checked={operationPrivacy}
                  onChange={(e) => setOperationPrivacy(e.target.checked)}
                />
                <span>
                  Ich akzeptiere die{" "}
                  <a href="#" className="underline">
                    Datenschutzbestimmungen
                  </a>{" "}
                  für Betriebskosten.
                </span>
              </label>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="accent-[#2563EB] mt-1 w-5 h-5 rounded-md border border-gray-300"
                  checked={operationConditions}
                  onChange={(e) => setOperationConditions(e.target.checked)}
                />
                <span>
                  Ich akzeptiere die{" "}
                  <a href="#" className="underline">
                    Allgemeinen Finanzierungsbedingungen
                  </a>{" "}
                  für Betriebskosten.
                </span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className={`w-full font-semibold py-3 rounded-lg shadow transition-shadow ${
                  operationProvider &&
                  operationDurationValue &&
                  operationDocument &&
                  operationPrivacy &&
                  operationConditions
                    ? "bg-white text-[#2563EB] hover:shadow-md"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                disabled={
                  isOperationSubmitting ||
                  !operationProvider ||
                  !operationDurationValue ||
                  !operationDocument ||
                  !operationPrivacy ||
                  !operationConditions
                }
              >
                {isOperationSubmitting ? "Speichere..." : "Weiter"}
              </button>
            </div>
          </form>
          ) : (
            renderLeadMissingNotice()
          )
        )}

        {categoryIndex === 3 && (
          currentLeadId ? (
          <form
            onSubmit={handleCasinoSubmit}
            className="mt-6 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-5 text-left"
            style={{ backgroundColor: "#fafafc" }}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Casino-Verluste</h2>
            </div>
            <p className="text-xs uppercase tracking-wide text-center text-gray-400">
              (Mehrfach Auswahl möglich)
            </p>

            <div className="space-y-3">
              {casinoVendors.map((vendor) => {
                const active = selectedCasinoProviders.includes(vendor);
                return (
                  <label
                    key={vendor}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-base font-semibold transition-all ${
                      active
                        ? "border-[#2563EB] bg-white shadow-md text-[#2563EB]"
                        : "border-gray-200 bg-white text-gray-800"
                    }`}
                  >
                    <span>{vendor}</span>
                    <input
                      type="checkbox"
                      className="accent-[#2563EB] w-5 h-5"
                      checked={active}
                      onChange={() => handleCasinoProviderToggle(vendor)}
                    />
                  </label>
                );
              })}
            </div>

            <div className="space-y-3 text-sm text-gray-900">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600">Verlustsumme</label>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9.,]*"
                  value={casinoAmount}
                  onChange={(e) => setCasinoAmount(e.target.value)}
                  className="rounded-lg border border-[#2563EB] px-3 py-2 text-sm text-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600">Notizen</label>
                <textarea
                  rows={4}
                  value={casinoNotes}
                  onChange={(e) => setCasinoNotes(e.target.value)}
                  className="rounded-lg border border-[#2563EB] px-3 py-2 text-sm text-[#2563EB] placeholder:text-[#2563EB]/60 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600">Dokument (Nachweis)</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setCasinoDocument(e.target.files?.[0] ?? null)}
                  className="rounded-lg border border-dashed border-[#2563EB] px-3 py-2 text-sm text-[#2563EB]"
                />
                {casinoDocument && (
                  <p className="text-xs text-gray-500">
                    {casinoDocument.name} · {(casinoDocument.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>

              <label className="flex items-start gap-3 text-sm text-gray-900">
                <input
                  type="checkbox"
                  className="accent-[#2563EB] mt-1 w-5 h-5 rounded-md border border-gray-300"
                  checked={casinoPrivacy}
                  onChange={(e) => setCasinoPrivacy(e.target.checked)}
                />
                <span>
                  Ich akzeptiere die{" "}
                  <a href="#" className="underline">
                    Datenschutzbestimmungen
                  </a>{" "}
                  für Casino-Verluste.
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm text-gray-900">
                <input
                  type="checkbox"
                  className="accent-[#2563EB] mt-1 w-5 h-5 rounded-md border border-gray-300"
                  checked={casinoConditions}
                  onChange={(e) => setCasinoConditions(e.target.checked)}
                />
                <span>
                  Ich akzeptiere die{" "}
                  <a href="#" className="underline">
                    Allgemeinen Finanzierungsbedingungen
                  </a>{" "}
                  für Casino-Verluste.
                </span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className={`w-full font-semibold py-3 rounded-lg shadow transition-shadow ${
                  selectedCasinoProviders.length &&
                  isCasinoAmountValid &&
                  casinoPrivacy &&
                  casinoConditions &&
                  casinoDocument
                    ? "bg-white text-[#2563EB] hover:shadow-md"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                disabled={
                  isCasinoSubmitting ||
                  !selectedCasinoProviders.length ||
                  !isCasinoAmountValid ||
                  !casinoPrivacy ||
                  !casinoConditions ||
                  !casinoDocument
                }
              >
                {isCasinoSubmitting ? "Speichere..." : "Abschließen"}
              </button>
            </div>
          </form>
          ) : (
            renderLeadMissingNotice()
          )
        )}

        {categoryIndex > 3 && (
          <div
            className="mt-6 w-full max-w-3xl rounded-2xl shadow-2xl p-10 text-center space-y-4"
            style={{ backgroundColor: "#fafafc" }}
          >
            <h2 className="text-2xl font-semibold text-gray-900">
              {categoryTabs[categoryIndex].label}
            </h2>
            <p className="text-gray-500">
              Dieser Abschnitt wird als nächstes ausgearbeitet. Nutze die Punkte oben, um
              direkt zu einem Schritt zu springen.
            </p>
            {categoryIndex < categoryTabs.length - 1 && (
              <button
                onClick={() =>
                  setCategoryIndex((prev) => Math.min(prev + 1, categoryTabs.length - 1))
                }
                className="bg-[#2563EB] text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-[#1D4ED8] transition-colors"
              >
                Weiter
              </button>
            )}
          </div>
        )}
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 rounded-xl px-5 py-3 text-sm font-medium shadow-2xl border ${
            toast.type === "success"
              ? "bg-[#0F172A] text-white border-[#22c55e]"
              : "bg-[#0F172A] text-white border-[#f87171]"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
