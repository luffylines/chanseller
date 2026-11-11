import Link from "next/link";
import { ShoppingBag, Sparkles } from "lucide-react";

export function Brand({ to = "/" }: { to?: string; light?: boolean }) {
  return <Link href={to} className="brand" aria-label="ChanSeller home">
    <span className="brand-icon"><ShoppingBag size={20} strokeWidth={2.25}/><Sparkles className="brand-sparkle" size={11} strokeWidth={2.8}/></span>
    <span>Chan<span>Seller</span></span>
  </Link>;
}
