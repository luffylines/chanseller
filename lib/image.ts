export type PresetId="white"|"peach"|"lavender"|"mint"|"midnight"|"color"|"studio"|"lifestyle"|"minimal";
export type Adjustments={brightness:number;contrast:number;saturation:number};
export type ExportSize="square"|"portrait"|"story";
export const presets:{id:PresetId;name:string;colors:[string,string]}[]=[
  {id:"white",name:"Studio white",colors:["#ffffff","#f2f5fa"]},
  {id:"peach",name:"Warm peach",colors:["#fff0e6","#ffd1b9"]},
  {id:"lavender",name:"Soft lilac",colors:["#f4edff","#dacafb"]},
  {id:"mint",name:"Fresh mint",colors:["#e9fff8","#c4efdf"]},
  {id:"midnight",name:"Midnight",colors:["#414d68","#171f34"]},
  {id:"color",name:"Color",colors:["#ccecff","#fdd6ec"]},
  {id:"studio",name:"Studio",colors:["#f4efe5","#c8ad8e"]},
  {id:"lifestyle",name:"Lifestyle",colors:["#f1f5ed","#c9b79c"]},
  {id:"minimal",name:"Minimal",colors:["#f8f9f9","#d9e0e5"]}
];
export const scenePaths:Partial<Record<PresetId,string>>={color:"/scenes/color.svg",studio:"/scenes/studio.svg",lifestyle:"/scenes/lifestyle.svg",minimal:"/scenes/minimal.svg"};
const dimensions:Record<ExportSize,[number,number]>={square:[1200,1200],portrait:[1080,1350],story:[1080,1920]};
function loadImage(src:string):Promise<HTMLImageElement>{
  return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error("Image could not be loaded."));im.src=src;});
}
export function safeFilename(name:string){return name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,70)||"product";}
export function downloadBlob(blob:Blob,filename:string){
  const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1800);
}
export async function createStudioExport(src:string,preset:PresetId,adjust:Adjustments,options?:{size?:ExportSize;shadow?:boolean;watermark?:string}):Promise<Blob>{
  const img=await loadImage(src);
  const [width,height]=dimensions[options?.size||"square"];
  const canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Canvas unavailable.");
  const colors=presets.find(p=>p.id===preset)?.colors||presets[0].colors;
  const scene=scenePaths[preset];
  if(scene){
    const sceneImage=await loadImage(scene);
    // Scale scene backgrounds to fill without stretching the visual props.
    const ratio=Math.max(width/sceneImage.naturalWidth,height/sceneImage.naturalHeight);
    const bw=sceneImage.naturalWidth*ratio,bh=sceneImage.naturalHeight*ratio;
    ctx.drawImage(sceneImage,(width-bw)/2,(height-bh)/2,bw,bh);
  }else{
    const bg=ctx.createLinearGradient(0,0,width,height);bg.addColorStop(0,colors[0]);bg.addColorStop(1,colors[1]);ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);
  }
  const temp=document.createElement("canvas");temp.width=img.naturalWidth;temp.height=img.naturalHeight;
  const tctx=temp.getContext("2d",{willReadFrequently:true});if(!tctx)throw new Error("Canvas unavailable.");tctx.drawImage(img,0,0);
  const pixels=tctx.getImageData(0,0,temp.width,temp.height).data;
  let minX=temp.width,minY=temp.height,maxX=0,maxY=0;
  const step=1;
  for(let y=0;y<temp.height;y+=step)for(let x=0;x<temp.width;x+=step){if(pixels[(y*temp.width+x)*4+3]>18){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}}
  if(maxX<=minX||maxY<=minY){minX=0;minY=0;maxX=temp.width-1;maxY=temp.height-1;}
  const sw=Math.max(1,maxX-minX+1),sh=Math.max(1,maxY-minY+1);
  const scale=Math.min(width*.76/sw,height*.72/sh);
  const drawW=sw*scale,drawH=sh*scale,dx=(width-drawW)/2,dy=(height-drawH)/2-height*.025;
  if(options?.shadow!==false){
    const sx=width/2,sy=Math.min(height*.87,dy+drawH+height*.035);
    const radius=Math.max(drawW*.55,width*.11);
    ctx.save();ctx.translate(sx,sy);ctx.scale(1,.23);
    const grad=ctx.createRadialGradient(0,0,0,0,0,radius);
    grad.addColorStop(0,preset==="midnight"?"rgba(0,0,0,.38)":"rgba(35,51,72,.20)");
    grad.addColorStop(1,"rgba(30,40,50,0)");
    ctx.fillStyle=grad;ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  ctx.save();ctx.filter=`brightness(${adjust.brightness}%) contrast(${adjust.contrast}%) saturate(${adjust.saturation}%)`;
  ctx.drawImage(temp,minX,minY,sw,sh,dx,dy,drawW,drawH);ctx.restore();
  if(options?.watermark){
    const size=Math.max(15,Math.floor(width*.024));ctx.font=`600 ${size}px Arial, sans-serif`;ctx.textAlign="right";ctx.fillStyle=preset==="midnight"?"rgba(255,255,255,.63)":"rgba(37,66,91,.42)";
    ctx.fillText(options.watermark.slice(0,45),width-45,height-39);
  }
  return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("PNG export failed.")),"image/png"));
}
