"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { motion } from "motion/react";

const items = [
  {
    q: "無料体験中は何ができますか？",
    a: "動画・音声・復習機能・進捗トラッキングなど、すべての機能をフルでご利用いただけます。レッスンは各資格から数本を体験用に公開しています。続けたい方は10日経過後に月¥980で全レッスンが開放されます。",
  },
  {
    q: "なぜ最初にお支払い情報の登録が必要なのですか？",
    a: "10日間の無料体験のあと自動で有料プランに切り替わるためです。体験中に解約すれば料金は発生しません。",
  },
  {
    q: "解約はどこからできますか？",
    a: "設定 > サブスクリプション からいつでも解約できます。解約後も期間終了まで利用できます。",
  },
  {
    q: "質問やメンターはありますか？",
    a: "Qu は自学型の資格学習サービスです。講師への質問機能やメンタリングは提供していません。動画・音声・問題演習で、自分のペースで学習を進めるかたちです。",
  },
  {
    q: "対応資格は増えますか？",
    a: "現在の4資格に加えて、今後追加・入替を予定しています。リクエストは設定からお送りいただけます。",
  },
  {
    q: "合格保証はありますか？",
    a: "合格保証は提供していません。合格は試験当日のあなた自身の理解度によります。Qu は最後まで続けやすい学習環境を提供します。",
  },
  {
    q: "推奨デバイスは？",
    a: "iPad / タブレット中心の設計ですが、PC・スマートフォンでもご利用いただけます。音声解説はスマートフォンでの隙間時間学習にも適しています。",
  },
];

export function FAQ(): React.ReactElement {
  return (
    <section id="faq" className="relative py-[80px] lg:py-[120px] bg-surface-container-low">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-16 items-start">
          {/* Left: heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="lg:sticky lg:top-24"
          >
            <p className="section-eyebrow mb-4"># 07 — Q&amp;A</p>
            <h2
              className="font-[family-name:var(--font-display)] font-extrabold tracking-tight text-deep-onyx leading-none"
              style={{ fontSize: "clamp(2rem,4vw,3.5rem)", letterSpacing: "-0.02em" }}
            >
              気になること、<br />すべて。
            </h2>
          </motion.div>

          {/* Right: accordion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
          >
            <Accordion.Root type="single" collapsible className="space-y-2">
              {items.map((item, i) => (
                <Accordion.Item
                  key={i}
                  value={`item-${i}`}
                  className="rounded-lg border border-[rgba(32,32,32,0.1)] bg-pure-white overflow-hidden data-[state=open]:border-electric-blue transition-all duration-200"
                >
                  <Accordion.Header>
                    <Accordion.Trigger className="group flex items-start justify-between w-full px-6 py-5 text-left hover:bg-surface-container-lowest transition-colors duration-200">
                      <div className="pr-4">
                        <p className="font-[family-name:var(--font-label)] text-[11px] tracking-widest uppercase text-electric-blue mb-1.5">
                          Q.{String(i + 1).padStart(2, "0")}
                        </p>
                        <span className="font-[family-name:var(--font-display)] font-semibold text-base text-deep-onyx leading-snug">
                          {item.q}
                        </span>
                      </div>
                      <span
                        className="material-symbols-outlined text-on-surface-variant transition-transform duration-200 group-data-[state=open]:rotate-180 flex-shrink-0 mt-0.5"
                        aria-hidden="true"
                      >
                        expand_more
                      </span>
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content
                    className="overflow-hidden data-[state=open]:animate-[accordion-down_200ms_ease-out] data-[state=closed]:animate-[accordion-up_200ms_ease-out]"
                  >
                    <div className="px-6 pb-5 text-sm text-on-surface-variant leading-relaxed border-t border-[rgba(32,32,32,0.06)] pt-4">
                      {item.a}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes accordion-down {
          from { height: 0; }
          to { height: var(--radix-accordion-content-height); }
        }
        @keyframes accordion-up {
          from { height: var(--radix-accordion-content-height); }
          to { height: 0; }
        }
      `}</style>
    </section>
  );
}
