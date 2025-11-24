import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const STORAGE_BUCKET = "energie_rechnungen";
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
    const customerNumber = formData.get("customerNumber")?.toString();
    const file = formData.get("document") as File | null;
    const leadId = formData.get("leadId")?.toString();

    if (!provider || !customerNumber || !file || !leadId) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileId = crypto.randomUUID();
    const filePath = `energy/${fileId}-${file.name}`;

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

    const proxyUrl = `${PUBLIC_APP_URL}/api/energy/files/${fileId}`;

    const { error: insertError } = await supabase.from("energie_daten").insert({
      provider,
      customer_number: customerNumber,
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
    console.error("Energy submission failed:", error);
    return NextResponse.json(
      { error: "Energie-Daten konnten nicht gespeichert werden." },
      { status: 500 }
    );
  }
}

