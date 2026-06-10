"use client";

import { motion } from "framer-motion";
import type { Book, Shelf } from "@/types/book";
import type { AdminSection } from "./AdminLayout";

interface DashboardProps {
  books: Book[];
  shelves: Shelf[];
  onNavigate: (s: AdminSection) => void;
}

/** A summary card with a big number. */
function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: string;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="dash-card flex items-center gap-4 p-5"
    >
      <span
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl ${tone}`}
      >
        {icon}
      </span>
      <div>
        <p className="font-display text-3xl font-bold leading-none">{value}</p>
        <p className="mt-1 text-[13px] text-[#8a7458]">{label}</p>
      </div>
    </motion.div>
  );
}

const SHOPIFY_STEPS = [
  { n: 1, icon: "🛍️", title: "商品を登録", body: "Shopify商品管理で本を登録します。" },
  { n: 2, icon: "🏷️", title: "詳細を設定", body: "メタフィールドで表紙・背表紙・判型・試し読みを設定。" },
  { n: 3, icon: "🗂️", title: "棚を管理", body: "Metaobjectでおすすめ棚・特集棚を管理します。" },
  { n: 4, icon: "🌲", title: "本棚に反映", body: "本棚UIに自動で反映されます。" },
  { n: 5, icon: "💳", title: "決済へ", body: "Shopifyカート・決済へ連携します。" },
];

export function Dashboard({ books, shelves, onNavigate }: DashboardProps) {
  const featuredCount = books.filter((b) => b.featured).length;
  const unassignedCount = books.filter((b) => (b.shelfIds ?? []).length === 0).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">ダッシュボード</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[#6a523a]">
          この画面から、本の追加・背表紙画像の登録・棚の並び替え・特集棚の作成ができます。
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="📚" label="登録済みの本" value={books.length} tone="bg-[#e7f0e0]" />
        <StatCard icon="🗄️" label="作成済みの棚" value={shelves.length} tone="bg-[#e2ecf5]" />
        <StatCard icon="⭐" label="おすすめ表示中" value={featuredCount} tone="bg-[#fbeed3]" />
        <StatCard icon="📭" label="未設定の本" value={unassignedCount} tone="bg-[#f3e3e0]" />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => onNavigate("books")} className="dash-btn-primary">
          ＋ 本を追加
        </button>
        <button onClick={() => onNavigate("shelves")} className="dash-btn-ghost">
          ＋ 棚を追加
        </button>
        <button onClick={() => onNavigate("preview")} className="dash-btn-ghost">
          👀 お店の見え方を確認
        </button>
      </div>

      {unassignedCount > 0 && (
        <div className="dash-card flex items-start gap-3 border-l-4 border-l-[#c98a3c] p-5">
          <span className="text-xl">💡</span>
          <p className="text-[14px] leading-relaxed text-[#6a523a]">
            まだどの棚にも並んでいない本が{" "}
            <span className="font-bold text-[#a86f2c]">{unassignedCount} 冊</span>{" "}
            あります。「本棚管理」から棚に追加すると、お客様の本棚に表示されます。
          </p>
        </div>
      )}

      {/* Shopify future integration */}
      <section className="dash-card p-6 md:p-8">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xl">🔗</span>
          <h2 className="font-display text-xl font-bold">本番Shopify連携イメージ</h2>
        </div>
        <p className="mb-6 text-[14px] text-[#8a7458]">
          本番では、運営者様の操作がそのままお店に反映される流れになります。
        </p>

        <ol className="flex flex-col gap-3 md:flex-row md:items-stretch">
          {SHOPIFY_STEPS.map((step, i) => (
            <li key={step.n} className="flex flex-1 items-stretch gap-3 md:flex-col">
              <div className="flex flex-1 flex-col rounded-2xl border border-[#e6dcc6] bg-white/60 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#3a2c1c] text-[12px] font-bold text-[#f5b860]">
                    {step.n}
                  </span>
                  <span className="text-xl">{step.icon}</span>
                </div>
                <p className="font-display text-[15px] font-bold text-[#3a2c1c]">
                  {step.title}
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-[#8a7458]">
                  {step.body}
                </p>
              </div>
              {i < SHOPIFY_STEPS.length - 1 && (
                <span className="hidden self-center text-2xl text-[#c9b48c] md:block">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
