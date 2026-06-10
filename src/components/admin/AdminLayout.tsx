"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export type AdminSection = "dashboard" | "books" | "shelves" | "preview";

const NAV: { id: AdminSection; label: string; icon: string; sub: string }[] = [
  { id: "dashboard", label: "ダッシュボード", icon: "🏠", sub: "全体のようす" },
  { id: "books", label: "商品管理", icon: "📚", sub: "本の追加・編集" },
  { id: "shelves", label: "本棚管理", icon: "🗄️", sub: "棚づくり・並び替え" },
  { id: "preview", label: "プレビュー", icon: "👀", sub: "お店の見え方" },
];

interface AdminLayoutProps {
  active: AdminSection;
  onNavigate: (s: AdminSection) => void;
  onReset: () => void;
  children: React.ReactNode;
}

/**
 * Two-column shell for the store-owner dashboard. Warm paper background, dark
 * brown ink, a soft wood-toned sidebar. Deliberately calm and non-technical.
 */
export function AdminLayout({
  active,
  onNavigate,
  onReset,
  children,
}: AdminLayoutProps) {
  return (
    <div
      className="min-h-[100dvh] w-full text-[#3a2c1c]"
      style={{
        background:
          "radial-gradient(120% 80% at 0% 0%, #f3ead6 0%, #efe4ce 40%, #e9dcc2 100%)",
      }}
    >
      {/* Demo notice ribbon */}
      <div className="border-b border-[#e0d0ad] bg-[#3a2c1c] px-5 py-2.5 text-center text-[12.5px] leading-relaxed text-[#f0e3c9]">
        これはデモ用の管理画面です。本番では Shopify
        の商品管理・メタフィールド・Metaobject と連携し、運営者様が商品追加や棚更新を行える構成にできます。
      </div>

      <div className="mx-auto flex max-w-[1200px] flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="shrink-0 border-b border-[#e0d3b8] px-4 py-5 md:w-64 md:border-b-0 md:border-r md:py-8">
          <div className="mb-6 flex items-center gap-3 px-2">
            <span className="text-2xl">🌲</span>
            <div>
              <p className="font-display text-lg font-bold leading-tight">本の森</p>
              <p className="text-[12px] text-[#9a8362]">店主のための管理画面</p>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto md:flex-col md:gap-1.5 md:overflow-visible">
            {NAV.map((item) => {
              const on = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors md:w-full ${
                    on ? "text-[#3a2c1c]" : "text-[#82704f] hover:bg-white/50"
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="admin-nav-pill"
                      className="absolute inset-0 rounded-xl bg-white shadow-[0_6px_16px_-8px_rgba(90,63,40,0.4)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative text-xl">{item.icon}</span>
                  <span className="relative">
                    <span className="block text-[15px] font-bold leading-tight">
                      {item.label}
                    </span>
                    <span className="block text-[11.5px] text-[#9a8362]">
                      {item.sub}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="mt-6 hidden flex-col gap-2 md:flex">
            <Link
              href="/"
              className="rounded-xl px-4 py-2.5 text-[14px] font-semibold text-[#6a523a] transition-colors hover:bg-white/50"
            >
              ← お店を見る
            </Link>
            <button
              onClick={onReset}
              className="rounded-xl px-4 py-2.5 text-left text-[13px] text-[#a08a66] transition-colors hover:bg-white/50"
            >
              デモ内容をリセット
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 px-5 py-7 md:px-10 md:py-9">{children}</main>
      </div>
    </div>
  );
}
