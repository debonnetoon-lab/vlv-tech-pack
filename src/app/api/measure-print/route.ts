import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image_base64, garment_sku, flat_width_cm } = body;

    if (!image_base64) {
      return NextResponse.json(
        { error: "no_image_provided", message: "Geen afbeelding ontvangen." },
        { status: 422 }
      );
    }

    // This is where the AI prompt would be processed by an LLM or Vision model.
    // For now, we return a high-quality mock response following the specification.
    
    // Simulating AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock logic: calculate based on provided flat_width_cm
    const scaleFactor = flat_width_cm / 1200; // Assuming 1200px flat width for the mock
    
    const result = {
      sku: garment_sku || "STANLEY_STELLA_L",
      garment_type: "T-shirt",
      flat_width_cm: flat_width_cm || 54.0,
      flat_width_px: 1200,
      scale_factor: scaleFactor,
      print: {
        width_cm: 19.5,
        height_cm: 12.8,
        pos_under_neck_cm: 6.5,
        technique: "screenprint",
        tolerances_mm: 5,
        confidence: 0.94
      },
      pixel_box: {
        left_px: 480,
        top_px: 410,
        right_px: 720,
        bottom_px: 740
      },
      warnings: [],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI Measure Error:", error);
    return NextResponse.json(
      { error: "internal_error", message: "Er is een fout opgetreden bij de AI analyse." },
      { status: 500 }
    );
  }
}
