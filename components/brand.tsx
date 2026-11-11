import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Brand({ light = false, to = "/" }: { light?: boolean; to?: string }) {
  return <Link href={to} className={"brand-lockup " + (light ? "brand-lockup-light" : "")} aria-label="ChanSeller home">
    <span className="brand-symbol"><Sparkles size={19} strokeWidth={2.6} /></span>
    <span>chan<span className="brand-strong">seller</span><span className="brand-dot">.</span></span>
  </Link>;
}
