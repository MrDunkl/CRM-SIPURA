import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const STORAGE_BUCKET = "casinoverluste";
const PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const providersRaw = formData.get("providers")?.toString() ?? "[]";
    const amountRaw = formData.get("amount")?.toString();
    const notes = formData.get("notes")?.toString() ?? "";
    const consentPrivacyRaw = formData.get("consentPrivacy")?.toString();
    const consentConditionsRaw = formData.get("consentConditions")?.toString();
    const leadId = formData.get("leadId")?.toString();
    const file = formData.get("document") as File | null;

    let providers: string[] = [];
    try {
      const parsed = JSON.parse(providersRaw);
      if (Array.isArray(parsed)) {
        providers = parsed;
      }
    } catch {
      providers = [];
    }

    const consentPrivacy = consentPrivacyRaw === "true" || consentPrivacyRaw === "1";
    const consentConditions = consentConditionsRaw === "true" || consentConditionsRaw === "1";
    const normalizedAmount = amountRaw ? Number(amountRaw) : NaN;

    if (
      !providers.length ||
      !amountRaw ||
      Number.isNaN(normalizedAmount) ||
      !leadId ||
      !file
    ) {
      return NextResponse.json({ error: "Payload is incomplete." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileId = crypto.randomUUID();
    const filePath = `casino/${fileId}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
      });

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

    const proxyUrl = `${PUBLIC_APP_URL}/api/casino/files/${fileId}`;

    const { error } = await supabase.from("casino_verluste_daten").insert({
      providers,
      amount: normalizedAmount,
      notes,
      consent_privacy: consentPrivacy,
      consent_conditions: consentConditions,
      lead_id: leadId,
      file_id: fileId,
      document_storage_path: filePath,
      document_url: publicUrl,
      document_proxy_url: proxyUrl,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Casino submission failed:", err);
    return NextResponse.json(
      { error: "Casino submission failed. Please try again." },
      { status: 500 }
    );
  }
}

