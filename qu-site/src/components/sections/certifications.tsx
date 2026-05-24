"use client";

import { motion } from "motion/react";

const certs = [
  {
    name: "ITパスポート",
    tag: "IT入門の登竜門",
    difficulty: "LEVEL 2",
    short: "iP",
    color: "bg-cert-ip",
  },
  {
    name: "基本情報技術者",
    tag: "エンジニアの基礎",
    difficulty: "LEVEL 3",
    short: "FE",
    color: "bg-cert-fe",
  },
  {
    name: "生成AIパスポート",
    tag: "生成AIの基礎",
    difficulty: "LEVEL 2",
    short: "AI",
    color: "bg-cert-genai",
  },
  {
    name: "G検定",
    tag: "AI/DL の基礎",
    difficulty: "LEVEL 3",
    short: "G",
    color: "bg-cert-gken",
  },
];

export function Certifications(): React.ReactElement {
  return (
    <section id="certifications" className="relative py-[80px] lg:py-[120px] bg-surface-mist">
      <div className="mx-auto max-w-[1280px] px-6">
        {/* Header — asymmetric layout */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16 items-end">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <p className="section-eyebrow mb-4"># 03 — WHAT</p>
            <h2
              className="font-[family-name:var(--font-display)] font-extrabold tracking-tight text-deep-onyx leading-none"
              style={{ fontSize: "clamp(2rem,5vw,4rem)", letterSpacing: "-0.02em" }}
            >
              キャリアを動かす、<br />4つの資格。
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="text-lg text-on-surface-variant leading-relaxed max-w-md"
          >
            月¥980 ですべて受け放題。1つ受かったら、次へ進めます。
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {certs.map((cert, i) => (
            <motion.div
              key={cert.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.07, ease: [0.4, 0, 0.2, 1] }}
              className="card group cursor-default"
            >
              {/* Color header */}
              <div className={`${cert.color} h-36 flex items-center justify-center rounded-t-lg overflow-hidden`}>
                <span
                  className="font-[family-name:var(--font-display)] font-extrabold text-6xl text-white tracking-tight select-none"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {cert.short}
                </span>
              </div>

              <div className="p-5">
                <p className="font-[family-name:var(--font-label)] text-[11px] tracking-widest uppercase text-on-surface-variant mb-2">
                  {cert.difficulty}
                </p>
                <h3 className="font-[family-name:var(--font-display)] font-bold text-base text-deep-onyx leading-tight">
                  {cert.name}
                </h3>
                <p className="mt-1 text-sm text-on-surface-variant">{cert.tag}</p>

                <div className="mt-4 flex items-center gap-1.5">
                  <span className="chip chip-active text-[11px]">受け放題</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
