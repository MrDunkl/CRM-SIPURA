import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const STORAGE_BUCKET = "casinoverluste";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const { id: fileId } = await context.params;
    if (!fileId) {
      return NextResponse.json({ error: "Missing file id." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("casino_verluste_daten")
      .select("document_storage_path")
      .eq("file_id", fileId)
      .maybeSingle();

    if (error || !data?.document_storage_path) {
      return NextResponse.json({ error: "Datei nicht gefunden." }, { status: 404 });
    }

    const { data: downloadData, error: downloadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(data.document_storage_path);

    if (downloadError || !downloadData) {
      return NextResponse.json({ error: "Download fehlgeschlagen." }, { status: 500 });
    }

    const buffer = Buffer.from(await downloadData.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": downloadData.type || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("Casino file proxy failed:", err);
    return NextResponse.json({ error: "Unbekannter Fehler." }, { status: 500 });
  }
}

