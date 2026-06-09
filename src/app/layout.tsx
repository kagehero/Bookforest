import type { Metadata, Viewport } from "next";
import { Shippori_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

const mincho = Shippori_Mincho({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const gothic = Zen_Kaku_Gothic_New({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "本の森 — Hon no Mori",
  description:
    "霧深い森の図書館で、運命の一冊と出会う。スマートフォンのための、没入型インタラクティブ本棚体験。",
};

export const viewport: Viewport = {
  themeColor: "#0c1410",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${mincho.variable} ${gothic.variable}`}>
      <body className="font-serif antialiased">{children}</body>
    </html>
  );
}
