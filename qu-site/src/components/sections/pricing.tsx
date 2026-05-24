"use client";

import { motion } from "motion/react";

const SIGNUP_URL = "https://qu-ez4q.onrender.com/sign_up";

const benefits = [
  "4資格すべて受け放題",
  "動画と音声、両方で学べる",
  "復習が自動で出題される",
  "いつでも解約できます",
  "解約金・追加料金なし",
];

export function Pricing(): React.ReactElement {
  return (
    <section id="pricing" className="relative py-[80px] lg:py-[120px] bg-pure-white overflow-hidden">
      {/* Background accent block */}
      <div
        className="absolute top-0 left-0 w-full h-1 bg-electric-blue"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <p className="section-eyebrow mb-4"># 06 — PRICE</p>
            <h2
              className="font-[family-name:var(--font-display)] font-extrabold tracking-tight text-deep-onyx leading-none mb-8"
              style={{ fontSize: "clamp(2.5rem,6vw,5rem)", letterSpacing: "-0.02em" }}
            >
              月¥980。<br />それだけ。
            </h2>
            <p className="text-lg text-on-surface-variant leading-relaxed max-w-md">
              参考書1冊よりも安く、4つの資格コースを受け放題。
              10日間は無料で全機能を試せます。
            </p>

            {/* Progress bar decoration */}
            <div className="mt-12 max-w-xs">
              <p className="font-[family-name:var(--font-label)] text-[11px] tracking-widest uppercase text-on-surface-variant mb-2">
                参考書との比較
              </p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between font-[family-name:var(--font-label)] text-[11px] tracking-wider uppercase text-on-surface-variant mb-1.5">
                    <span>参考書+過去問</span>
                    <span>¥4,000〜</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-indicator" style={{ width: "80%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-[family-name:var(--font-label)] text-[11px] tracking-wider uppercase text-on-surface-variant mb-1.5">
                    <span>Qu（月額）</span>
                    <span>¥980</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-indicator" style={{ width: "20%" }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: pricing card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="bg-surface-mist border border-[rgba(32,32,32,0.1)] rounded-lg p-8 lg:p-10">
              {/* Badge */}
              <div className="flex items-center gap-3 mb-8">
                <span className="chip chip-active">10日間 無料体験</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-1">
                <span
                  className="font-[family-name:var(--font-display)] font-extrabold text-deep-onyx leading-none"
                  style={{ fontSize: "clamp(4rem,10vw,6rem)", letterSpacing: "-0.02em" }}
                >
                  ¥980
                </span>
              </div>
              <p className="font-[family-name:var(--font-label)] text-sm tracking-wider text-on-surface-variant mb-2 uppercase">
                / 月（税込）
              </p>
              <p className="font-[family-name:var(--font-label)] text-xs tracking-wider text-on-surface-variant/70 mb-8">
                10日経過後より自動課金
              </p>

              {/* Benefits */}
              <ul className="space-y-3 mb-8">
                {benefits.map((b) => (
                  <li key={b} className="flex items-center gap-3">
                    <span
                      className="material-symbols-outlined text-electric-blue flex-shrink-0"
                      style={{ fontSize: "20px" }}
                      aria-hidden="true"
                    >
                      check
                    </span>
                    <span className="text-on-surface text-sm">{b}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={SIGNUP_URL}
                className="btn btn-primary btn-lg w-full group"
              >
                10日間 無料で試す
                <span
                  className="material-symbols-outlined text-xl transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  arrow_forward
                </span>
              </a>

              <p className="mt-4 font-[family-name:var(--font-label)] text-[11px] tracking-wider text-on-surface-variant/70 text-center leading-relaxed">
                ご登録時にお支払い情報の入力が必要です。期間中に解約すれば料金は発生しません。
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
