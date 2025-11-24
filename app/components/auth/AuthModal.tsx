"use client";

import { useState, type FormEvent } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSignedIn?: () => void;
}

const INTERNAL_DOMAIN = "@sipura.dev";

const generateEmployeeCode = () => {
  const letters = Math.random().toString(36).slice(2, 5).toUpperCase();
  const numbers = Math.floor(100 + Math.random() * 900);
  return `SIP-${letters}${numbers}`;
};

export default function AuthModal({ open, onClose, onSignedIn }: AuthModalProps) {
  const { supabaseClient } = useSessionContext();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  if (!open) return null;

  const closeAndReset = () => {
    setLoginEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setSignupEmail("");
    setStatusMessage(null);
    setGeneratedCode(null);
    onClose();
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const email = loginEmail.trim().toLowerCase();
      if (!email) {
        throw new Error("Bitte E-Mail eingeben.");
      }
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setStatusMessage("Erfolgreich eingeloggt.");
      onSignedIn?.();
      closeAndReset();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Login fehlgeschlagen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (event: FormEvent) => {
    event.preventDefault();
    if (!firstName || !lastName || !signupEmail.trim() || password.length < 6) {
      setStatusMessage("Bitte alle Felder ausfüllen (gültige E-Mail & Passwort min. 6 Zeichen).");
      return;
    }
    setIsSubmitting(true);
    setStatusMessage(null);
    const employeeCode = generateEmployeeCode();
    const aliasEmail = `${employeeCode.toLowerCase()}${INTERNAL_DOMAIN}`;
    try {
      const {
        data: { user },
        error,
      } = await supabaseClient.auth.signUp({
        email: signupEmail.trim().toLowerCase(),
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            employee_code: employeeCode,
            alias_email: aliasEmail,
          },
        },
      });
      if (error || !user) {
        throw error ?? new Error("Unbekannter Fehler bei der Registrierung.");
      }

      setGeneratedCode(employeeCode);
      setStatusMessage(
        `Account erstellt! Deine Mitarbeiter-ID lautet ${employeeCode}. Notiere sie zur Zuordnung. Einloggen erfolgt mit deiner E-Mail.`
      );
      setMode("login");
      setLoginEmail(signupEmail.trim().toLowerCase());
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Registrierung fehlgeschlagen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-gray-400">Mitarbeiter</p>
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === "login" ? "Anmelden" : "Account erstellen"}
            </h2>
          </div>
          <button
            onClick={closeAndReset}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Schließen"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-2 rounded-full bg-gray-100 p-1 text-xs font-semibold text-gray-500">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 rounded-full py-2 ${
              mode === "login" ? "bg-white text-gray-900 shadow" : ""
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-full py-2 ${
              mode === "signup" ? "bg-white text-gray-900 shadow" : ""
            }`}
          >
            Sign Up
          </button>
        </div>

        {statusMessage && (
          <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700">{statusMessage}</div>
        )}

        {mode === "login" ? (
          <form className="space-y-3" onSubmit={handleLogin}>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">E-Mail</label>
              <input
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:outline-none bg-white"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="z. B. vorname@firma.com"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Passwort</label>
              <input
                type="password"
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:outline-none bg-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#2563EB] py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#1D4ED8] disabled:opacity-60"
            >
              {isSubmitting ? "Anmeldung..." : "Einloggen"}
            </button>
          </form>
        ) : (
          <form className="space-y-3" onSubmit={handleSignup}>
            <div className="flex gap-3">
              <div className="flex-1 space-y-1">
                <label className="text-xs text-gray-600">Vorname</label>
                <input
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:outline-none bg-white"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-xs text-gray-600">Nachname</label>
                <input
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:outline-none bg-white"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">E-Mail</label>
              <input
                type="email"
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:outline-none bg-white"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="z. B. vorname@firma.com"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Passwort</label>
              <input
                type="password"
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2563EB] focus:outline-none bg-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 Zeichen"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#10b981] py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#059669] disabled:opacity-60"
            >
              {isSubmitting ? "Erstelle Account..." : "Account erstellen"}
            </button>

            {generatedCode && (
              <p className="rounded-2xl bg-gray-50 px-4 py-3 text-center text-sm text-gray-700">
                Merke dir deine Mitarbeiter-ID <strong>{generatedCode}</strong>. Login erfolgt weiterhin mit deiner
                E-Mail – die ID hilft uns bei der Zuordnung.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

