import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChanSeller — AI Product Studio for Online Sellers",
  description: "Turn ordinary product photos into clean, ready-to-list visuals. Remove backgrounds, style product images, and write product copy. Local development preview.",
  applicationName: "ChanSeller",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
