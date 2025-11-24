import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { value } = body;

    console.log("=".repeat(50));
    console.log("📨 Received random value from frontend:");
    console.log(`🔢 Value: ${value}`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    console.log("=".repeat(50));

    return NextResponse.json(
      {
        success: true,
        message: "Value logged successfully",
        receivedValue: value,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { success: false, message: "Error processing request" },
      { status: 500 }
    );
  }
}
