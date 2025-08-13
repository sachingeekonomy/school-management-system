import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    const hasKeyId = !!keyId;
    const hasKeySecret = !!keySecret;
    const keyIdLength = keyId?.length || 0;
    const keySecretLength = keySecret?.length || 0;
    
    // Test Razorpay initialization
    let razorpayInitialized = false;
    let razorpayError = null;
    
    try {
      const Razorpay = require("razorpay");
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      razorpayInitialized = !!razorpay;
    } catch (error) {
      razorpayError = error instanceof Error ? error.message : "Unknown error";
    }

    return NextResponse.json({
      environment: {
        hasKeyId,
        hasKeySecret,
        keyIdLength,
        keySecretLength,
        keyIdPrefix: keyId ? keyId.substring(0, 4) + "..." : null,
        keySecretPrefix: keySecret ? keySecret.substring(0, 4) + "..." : null,
      },
      razorpay: {
        initialized: razorpayInitialized,
        error: razorpayError,
      },
      message: hasKeyId && hasKeySecret 
        ? "Razorpay environment variables are set" 
        : "Razorpay environment variables are missing",
    });
  } catch (error) {
    console.error("Error testing Razorpay:", error);
    return NextResponse.json(
      { error: "Failed to test Razorpay configuration" },
      { status: 500 }
    );
  }
}
