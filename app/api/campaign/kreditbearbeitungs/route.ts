import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

interface CampaignLeadPayload {
  adminId?: string;
  persona?: string;
  selectedBanks?: string[];
  loanAmountRange?: string | null;
  borrowerCount?: string | null;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  consentPrivacy?: boolean;
  consentTerms?: boolean;
  metadata?: Record<string, unknown>;
}

const REQUIRED_PERSONAS = new Set(["private", "business"]);
const REQUIRED_BORROWER = new Set(["single", "multiple"]);

export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const body = (await request.json()) as CampaignLeadPayload;
    const {
      adminId,
      persona,
      selectedBanks,
      loanAmountRange,
      borrowerCount,
      contactName,
      contactPhone,
      contactEmail,
      consentPrivacy,
      consentTerms,
      metadata,
    } = body ?? {};

    if (!adminId) {
      return NextResponse.json(
        { error: "adminId is missing. Unable to assign campaign lead." },
        { status: 400 }
      );
    }

    if (!persona || !REQUIRED_PERSONAS.has(persona)) {
      return NextResponse.json({ error: "Persona is invalid." }, { status: 400 });
    }

    if (!Array.isArray(selectedBanks) || selectedBanks.length === 0) {
      return NextResponse.json({ error: "Mindestens eine Bank auswählen." }, { status: 400 });
    }

    if (!borrowerCount || !REQUIRED_BORROWER.has(borrowerCount)) {
      return NextResponse.json({ error: "Angabe zur Kreditnehmeranzahl fehlt." }, { status: 400 });
    }

    if (!loanAmountRange) {
      return NextResponse.json({ error: "Kreditsumme auswählen." }, { status: 400 });
    }

    if (!contactName?.trim() || !contactPhone?.trim() || !contactEmail?.trim()) {
      return NextResponse.json(
        { error: "Kontaktinformationen (Name, Telefon, E-Mail) werden benötigt." },
        { status: 400 }
      );
    }

    if (!consentPrivacy || !consentTerms) {
      return NextResponse.json(
        { error: "Bitte alle Pflichtzustimmungen aktivieren." },
        { status: 400 }
      );
    }

    const insertPayload = {
      admin_id: adminId,
      persona,
      selected_banks: selectedBanks,
      loan_amount_range: loanAmountRange,
      borrower_count: borrowerCount,
      contact_name: contactName,
      contact_phone: contactPhone,
      contact_email: contactEmail.toLowerCase(),
      consent_privacy: consentPrivacy,
      consent_terms: consentTerms,
      metadata: metadata ?? {},
    };

    const { data, error } = await supabase
      .from("campaign_kreditbearbeitungs_leads")
      .insert(insertPayload)
      .select("id")
      .single();

    if (error || !data?.id) {
      throw error ?? new Error("Supabase insert returned no id.");
    }

    return NextResponse.json({ success: true, leadId: data.id });
  } catch (error) {
    console.error("Campaign lead submission failed:", error);
    return NextResponse.json(
      { error: "Lead konnte nicht gespeichert werden." },
      { status: 500 }
    );
  }
}

