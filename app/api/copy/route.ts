import { NextRequest, NextResponse } from "next/server";
import { createTemplateCopy, type CopyResult, type ProductInput } from "@/lib/copy";

export const runtime = "nodejs";
const platforms = ["Shopee", "Lazada", "TikTok Shop", "Facebook", "Instagram"];
const tones = ["Friendly", "Premium", "Playful", "Minimal"];
const languages = ["English", "Taglish", "Filipino"];
function safeString(v: unknown, max: number) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(request: NextRequest) {
  let payload: Record<string, unknown>;
  try {
    if (Number(request.headers.get("content-length") || "0") > 20_000) {
      return NextResponse.json({ error: "Request too large." }, { status: 413 });
    }
    const value: unknown = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid request");
    payload = value as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const product: ProductInput = {
    name: safeString(payload.name, 120),
    category: safeString(payload.category, 90),
    features: safeString(payload.features, 1200),
    price: safeString(payload.price, 60),
    platform: platforms.includes(String(payload.platform)) ? payload.platform as ProductInput["platform"] : "Shopee",
    tone: tones.includes(String(payload.tone)) ? payload.tone as ProductInput["tone"] : "Friendly",
    language: languages.includes(String(payload.language)) ? payload.language as ProductInput["language"] : "Taglish",
  };
  if (!product.name) return NextResponse.json({ error: "Enter your product name first." }, { status: 400 });
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json(createTemplateCopy(product));
  }
  try {
    const prompt = [
      "You are an ethical Filipino ecommerce copywriter. Output ONLY a JSON object with exact string keys: title, description, caption, hashtags.",
      "Use the provided factual details only. Do NOT invent discounts, ratings, shipping promises, brand names, materials, certifications, dimensions, features, or health claims.",
      "Avoid spam, excessive hashtags, emojis in titles, or unrealistic claims. Make fluent natural copy suitable for the target marketplace and language.",
      "For missing details, omit the claims rather than guessing. Description should be clear and scan-friendly, with line breaks.",
      "Product input:", JSON.stringify(product),
    ].join("\n");
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.65 }
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(25_000),
    });
    if (!response.ok) throw new Error("Provider request failed");
    const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Missing provider result");
    const raw: unknown = JSON.parse(text);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Invalid result");
    const result = raw as Record<string, unknown>;
    const fallback = createTemplateCopy(product);
    const output: CopyResult = {
      title: safeString(result.title, 150) || fallback.title,
      description: safeString(result.description, 2200) || fallback.description,
      caption: safeString(result.caption, 900) || fallback.caption,
      hashtags: safeString(result.hashtags, 180) || fallback.hashtags,
      source: "gemini",
    };
    return NextResponse.json(output, { headers: { "Cache-Control": "no-store" } });
  } catch {
    // Always label fallback truthfully. No fake "AI generated" copy.
    return NextResponse.json({ ...createTemplateCopy(product), warning: "Gemini unavailable; showing a local template instead." });
  }
}
