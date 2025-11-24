import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const STORAGE_BUCKET = "betriebskosten";
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
    const provider = formData.get("provider")?.toString();
    const durationValue = formData.get("durationValue")?.toString();
    const durationUnit = formData.get("durationUnit")?.toString();
    const notes = formData.get("notes")?.toString() ?? "";
    const file = formData.get("document") as File | null;
    const leadId = formData.get("leadId")?.toString();

    if (!provider || !durationValue || !durationUnit || !file || !leadId) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const parsedDuration = Number(durationValue);
    if (Number.isNaN(parsedDuration)) {
      return NextResponse.json({ error: "Duration must be a number." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileId = crypto.randomUUID();
    const filePath = `betrieb/${fileId}-${file.name}`;

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

    const proxyUrl = `${PUBLIC_APP_URL}/api/betriebskosten/files/${fileId}`;

    const { error: insertError } = await supabase.from("betriebskosten_daten").insert({
      provider,
      duration_value: parsedDuration,
      duration_unit: durationUnit,
      notes,
      file_id: fileId,
      document_storage_path: filePath,
      document_url: publicUrl,
      document_proxy_url: proxyUrl,
      lead_id: leadId,
    });

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Betriebskosten submission failed:", error);
    return NextResponse.json(
      { error: "Betriebskosten konnten nicht gespeichert werden." },
      { status: 500 }
    );
  }
}

