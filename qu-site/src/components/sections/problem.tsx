"use client";

import { motion } from "motion/react";

export function Problem(): React.ReactElement {
  return (
    <section className="relative py-[80px] lg:py-[120px] bg-deep-onyx text-white overflow-hidden">
      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
        aria-hidden="true"
      />

      {/* Acid Lime corner accent */}
      <div
        className="absolute top-0 left-0 w-1 h-full bg-acid-lime"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1280px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <p className="section-eyebrow text-acid-lime mb-6">
            # 01 — PROBLEM
          </p>
          <h2
            className="font-[family-name:var(--font-display)] font-extrabold tracking-tight leading-none"
            style={{ fontSize: "clamp(2.5rem,6vw,5rem)", letterSpacing: "-0.02em" }}
          >
            分厚い参考書、
            <br />
            <span className="text-white/30">最後まで</span>
            読めましたか？
          </h2>
        </motion.div>

        <div className="mt-20 grid md:grid-cols-12 gap-y-12 gap-x-8 items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="md:col-span-7"
          >
            <p className="font-[family-name:var(--font-label)] text-xs tracking-[0.15em] uppercase text-white/40 mb-4">
              参考書 + 過去問の合計
            </p>
            <div
              className="font-[family-name:var(--font-display)] font-extrabold leading-none text-acid-lime"
              style={{ fontSize: "clamp(3.5rem,10vw,8rem)", letterSpacing: "-0.02em" }}
            >
              ¥4,000<span className="text-white/20">〜</span>¥5,000
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="md:col-span-5 space-y-6 text-lg md:text-xl text-white/70 leading-relaxed"
          >
            <p>買ったまま、開いていない参考書がある。</p>
            <p>問題集を解いても、何を間違えたか覚えていない。</p>
            <p>気づけば試験日が、迫っている。</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.45, ease: [0.4, 0, 0.2, 1] }}
          className="mt-24 max-w-3xl border-t border-white/10 pt-12"
        >
          <p
            className="font-[family-name:var(--font-display)] font-bold leading-snug"
            style={{ fontSize: "clamp(1.5rem,3vw,2rem)" }}
          >
            Qu なら、月{" "}
            <span className="text-acid-lime font-extrabold">¥980</span>。<br />
            参考書1冊買う前に、4資格すべて試せます。
          </p>
        </motion.div>
      </div>
    </section>
  );
}
