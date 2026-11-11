export type PresetId = "white" | "peach" | "lavender" | "mint" | "midnight";
export type Adjustments = { brightness: number; contrast: number; saturation: number };

export const presets: { id: PresetId; name: string; className: string; colors: [string,string] }[] = [
  { id: "white", name: "Studio white", className: "bg-preset-white", colors: ["#ffffff", "#f4f2f5"] },
  { id: "peach", name: "Warm peach", className: "bg-preset-peach", colors: ["#ffe2d3", "#ffc0b0"] },
  { id: "lavender", name: "Soft lilac", className: "bg-preset-lavender", colors: ["#f6eaff", "#d5bdfb"] },
  { id: "mint", name: "Fresh mint", className: "bg-preset-mint", colors: ["#e5fbf4", "#b3e8d6"] },
  { id: "midnight", name: "Midnight", className: "bg-preset-midnight", colors: ["#30344f", "#131626"] },
];

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve,reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read the processed image."));
    img.src = url;
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
export function safeFilename(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,64) || "product";
}

export async function createStudioExport(cutoutUrl: string, preset: PresetId, adjustments: Adjustments): Promise<Blob> {
  const img = await loadImage(cutoutUrl);
  const size = 1200;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported.");
  const p = presets.find(p => p.id === preset) || presets[0];
  const gradient = ctx.createLinearGradient(0,0,size,size);
  gradient.addColorStop(0,p.colors[0]);
  gradient.addColorStop(1,p.colors[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0,0,size,size);

  // Trim actual transparent pixels so objects are centered consistently.
  const sampling = document.createElement("canvas");
  sampling.width = img.naturalWidth;
  sampling.height = img.naturalHeight;
  const sctx = sampling.getContext("2d", { willReadFrequently: true });
  if (!sctx) throw new Error("Canvas is not supported.");
  sctx.drawImage(img,0,0);
  const pixels = sctx.getImageData(0,0,sampling.width,sampling.height).data;
  let left = sampling.width, top = sampling.height, right = 0, bottom = 0;
  for (let y=0;y<sampling.height;y+=2) for (let x=0;x<sampling.width;x+=2) {
    if (pixels[(y*sampling.width+x)*4+3] > 18) {
      left = Math.min(left,x); right = Math.max(right,x);
      top = Math.min(top,y); bottom = Math.max(bottom,y);
    }
  }
  if (right <= left || bottom <= top) { left=0;top=0;right=sampling.width;bottom=sampling.height; }
  const w = Math.max(1,right-left+2), h = Math.max(1,bottom-top+2);
  const scale = Math.min(880/w, 900/h);
  const drawW=w*scale, drawH=h*scale;
  const dx=(size-drawW)/2, dy=(size-drawH)/2-18;

  // Subtle product grounding shadow, entirely independent of fake image generation.
  const shadow = ctx.createRadialGradient(size/2, 1030, 6, size/2, 1030, Math.max(150,drawW*.51));
  shadow.addColorStop(0,preset==="midnight" ? "rgba(0,0,0,.4)" : "rgba(55,41,68,.19)");
  shadow.addColorStop(1,"rgba(20,20,30,0)");
  ctx.fillStyle=shadow;
  ctx.beginPath(); ctx.ellipse(size/2,1030,Math.max(120,drawW*.53),57,0,0,Math.PI*2);ctx.fill();
  ctx.save();
  ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`;
  ctx.drawImage(sampling,left,top,w,h,dx,dy,drawW,drawH);
  ctx.restore();
  return new Promise((resolve,reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Could not export image.")), "image/png"));
}
