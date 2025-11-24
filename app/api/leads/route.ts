import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

type LeadIdentifier = string | number;

type DocumentLink = {
  id: string;
  provider: string;
  reference?: string;
  url: string;
  fallbackUrl?: string;
  created_at: string | null;
  notes?: string;
};

type DocumentBucket = {
  energie: DocumentLink[];
  betriebskosten: DocumentLink[];
  casino: DocumentLink[];
};

export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const client = supabase;
    const body = await request.json();
    const { leadData, kreditData } = body ?? {};

    if (!leadData || !kreditData || !leadData.employee_id) {
      return NextResponse.json({ error: "Payload is incomplete." }, { status: 400 });
    }

    const { data: leadInsert, error: leadError } = await client
      .from("lead_data")
      .insert(leadData)
      .select("id")
      .single();

    if (leadError || !leadInsert) {
      throw leadError ?? new Error("Lead insertion returned no data.");
    }

    const { error: kreditError } = await client.from("kreditgebuehren_data").insert({
      ...kreditData,
      lead_id: leadInsert.id,
    });

    if (kreditError) {
      throw kreditError;
    }

    return NextResponse.json({ success: true, leadId: leadInsert.id });
  } catch (error) {
    console.error("Lead submission failed:", error);
    return NextResponse.json(
      { error: "Lead submission failed. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const client = supabase;
    const employeeFilter = request.nextUrl.searchParams.get("employeeId") ?? undefined;

    let leadQuery = client
      .from("lead_data")
      .select(
        `
          id,
          created_at,
          lead_type,
          first_name,
          last_name,
          email,
          phone,
          nationality,
          birth_date,
          employment_status,
          consent_privacy,
          consent_conditions,
          employee_id
        `
      )
      .order("created_at", { ascending: false });

    if (employeeFilter) {
      leadQuery = leadQuery.eq("employee_id", employeeFilter);
    }

    const { data: leadRows, error: leadError } = await leadQuery;

    if (leadError) {
      throw leadError;
    }

    const leads = leadRows ?? [];
    const leadIds = leads
      .map((lead) => lead.id)
      .filter(
        (id): id is LeadIdentifier => typeof id === "string" || typeof id === "number"
      );

    const kreditByLead = new Map<LeadIdentifier, unknown>();

    if (leadIds.length) {
      const { data: kreditRows, error: kreditError } = await client
        .from("kreditgebuehren_data")
        .select(
          "id, lead_id, customer_type, selected_banks, loan_amount_range, borrower_count, created_at"
        )
        .in("lead_id", leadIds);

      if (kreditError) {
        throw kreditError;
      }

      (kreditRows ?? []).forEach((row) => {
        if (row?.lead_id) {
          kreditByLead.set(row.lead_id, row);
        }
      });
    }

    const documentBuckets = leadIds.length
      ? await fetchDocumentBuckets(client, leadIds)
      : new Map<LeadIdentifier, DocumentBucket>();

    const enrichedLeads = leads.map((lead) => ({
      ...lead,
      kredit: kreditByLead.get(lead.id) ?? null,
      documents: documentBuckets.get(lead.id) ?? { energie: [], betriebskosten: [] },
    }));

    return NextResponse.json({ leads: enrichedLeads });
  } catch (error) {
    console.error("Lead listing failed:", error);
    return NextResponse.json(
      { error: "Leads konnten nicht geladen werden." },
      { status: 500 }
    );
  }
}

const ENERGY_BUCKET = "energie_rechnungen";
const OPERATION_BUCKET = "betriebskosten";
const CASINO_BUCKET = "casinoverluste";

async function fetchDocumentBuckets(
  client: NonNullable<typeof supabase>,
  leadIds: LeadIdentifier[]
) {
  const buckets = new Map<LeadIdentifier, DocumentBucket>();
  leadIds.forEach((id) => {
    buckets.set(id, { energie: [], betriebskosten: [], casino: [] });
  });

  const { data: energyDocs, error: energyError } = await client
    .from("energie_daten")
    .select(
      "id, lead_id, provider, customer_number, file_id, document_url, document_proxy_url, document_storage_path, created_at"
    )
    .in("lead_id", leadIds);

  if (energyError) {
    console.warn("Energie-Dokumente konnten nicht geladen werden:", energyError.message);
  } else {
    const filteredDocs = await filterExistingStorageEntries(
      client,
      ENERGY_BUCKET,
      energyDocs ?? []
    );
    filteredDocs.forEach((doc) => {
      if (!doc?.lead_id) return;
      const bucket = buckets.get(doc.lead_id);
      if (!bucket) return;
      bucket.energie.push({
        id: doc.file_id ?? (doc.id ? String(doc.id) : `${doc.lead_id}-energie`),
        provider: doc.provider ?? "Unbekannter Anbieter",
        reference: doc.customer_number ?? undefined,
        url: doc.document_proxy_url ?? doc.document_url ?? "",
        fallbackUrl: doc.document_url ?? undefined,
        created_at: doc.created_at ?? null,
      });
    });
  }

  const { data: operationDocs, error: operationError } = await client
    .from("betriebskosten_daten")
    .select(
      "id, lead_id, provider, duration_value, duration_unit, notes, file_id, document_url, document_proxy_url, document_storage_path, created_at"
    )
    .in("lead_id", leadIds);

  if (operationError) {
    console.warn(
      "Betriebskosten-Dokumente konnten nicht geladen werden:",
      operationError.message
    );
  } else {
    const filteredDocs = await filterExistingStorageEntries(
      client,
      OPERATION_BUCKET,
      operationDocs ?? []
    );
    filteredDocs.forEach((doc) => {
      if (!doc?.lead_id) return;
      const bucket = buckets.get(doc.lead_id);
      if (!bucket) return;
      bucket.betriebskosten.push({
        id: doc.file_id ?? (doc.id ? String(doc.id) : `${doc.lead_id}-betrieb`),
        provider: doc.provider ?? "Unbekannter Anbieter",
        reference:
          doc.duration_value && doc.duration_unit
            ? `${doc.duration_value} ${doc.duration_unit === "jahre" ? "Jahre" : "Monate"}`
            : undefined,
        url: doc.document_proxy_url ?? doc.document_url ?? "",
        fallbackUrl: doc.document_url ?? undefined,
        created_at: doc.created_at ?? null,
        notes: doc.notes ?? undefined,
      });
    });
  }

  const { data: casinoDocs, error: casinoError } = await client
    .from("casino_verluste_daten")
    .select(
      "id, lead_id, providers, amount, notes, file_id, document_url, document_proxy_url, document_storage_path, created_at"
    )
    .in("lead_id", leadIds);

  if (casinoError) {
    console.warn("Casino-Dokumente konnten nicht geladen werden:", casinoError.message);
  } else {
    const filteredDocs = await filterExistingStorageEntries(
      client,
      CASINO_BUCKET,
      casinoDocs ?? []
    );
    filteredDocs.forEach((doc) => {
      if (!doc?.lead_id) return;
      const bucket = buckets.get(doc.lead_id);
      if (!bucket) return;
      const providerLabel = Array.isArray(doc.providers) && doc.providers.length
        ? doc.providers.join(", ")
        : "Casino-Verluste";
      bucket.casino.push({
        id: doc.file_id ?? (doc.id ? String(doc.id) : `${doc.lead_id}-casino`),
        provider: providerLabel,
        reference: doc.amount ? `Verlust: ${doc.amount} €` : undefined,
        url: doc.document_proxy_url ?? doc.document_url ?? "",
        fallbackUrl: doc.document_url ?? undefined,
        created_at: doc.created_at ?? null,
        notes: doc.notes ?? undefined,
      });
    });
  }

  return buckets;
}

async function filterExistingStorageEntries<T extends { document_storage_path?: string | null }>(
  client: NonNullable<typeof supabase>,
  bucket: string,
  docs: T[]
) {
  const checks = await Promise.all(
    docs.map(async (doc) => {
      if (!doc?.document_storage_path) return { doc, exists: false };
      const { error } = await client.storage
        .from(bucket)
        .createSignedUrl(doc.document_storage_path, 5);
      return { doc, exists: !error };
    })
  );
  return checks.filter((entry) => entry.exists).map((entry) => entry.doc);
}

