export type Platform = "Shopee" | "Lazada" | "TikTok Shop" | "Facebook" | "Instagram";
export type Tone = "Friendly" | "Premium" | "Playful" | "Minimal";
export type Language = "English" | "Taglish" | "Filipino";
export type ProductInput = {
  name: string;
  category: string;
  features: string;
  price: string;
  platform: Platform;
  tone: Tone;
  language: Language;
};
export type CopyResult = {
  title: string;
  description: string;
  caption: string;
  hashtags: string;
  source: "gemini" | "template";
};
export function createTemplateCopy(p: ProductInput): CopyResult {
  const name = p.name.trim() || "Your product";
  const details = p.features.trim();
  const price = p.price.trim();
  const tag = name.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).join("");
  const english = p.language === "English";
  const filipino = p.language === "Filipino";
  const lead = english ? "Meet" : filipino ? "Kilalanin ang" : "Check out";
  const title = [name, details && details.split(/[,.\n]/)[0].trim()].filter(Boolean).join(" | ").slice(0, 120);
  const description = [
    `${lead} ${name}.`,
    details ? (filipino ? `Detalye: ${details}.` : `Details: ${details}.`) : (english ? "Add your verified product details to personalize this listing." : "Ilagay ang verified product details para mas kumpleto ang listing."),
    price ? `Listed price: ${price}` : "",
    `Prepared for ${p.platform}. Check every specification before publishing.`
  ].filter(Boolean).join("\n\n");
  const caption = `${p.tone === "Playful" ? "✨ " : ""}${lead} ${name}! ${details || "See the product details for more information."}${price ? ` • ${price}` : ""}\n\n${filipino ? "Mag-message para sa karagdagang impormasyon." : english ? "Message us for more details." : "Message us for details! 💬"}`;
  return { title, description, caption, hashtags: `#${tag || "product"} #OnlineShop #ShopLocalPH`, source: "template" };
}
