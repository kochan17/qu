"use client";

import Image from "next/image";
import { motion } from "motion/react";

const principles = [
  {
    num: "01",
    title: "正答数で測るストリーク",
    body: "アプリを開いた回数ではなく、理解した数で進捗を測ります。",
    accent: "text-acid-lime",
  },
  {
    num: "02",
    title: "休んでも消えない",
    body: "休息日 Pause を無料で提供。続けることに罰を与えません。",
    accent: "text-acid-lime",
  },
  {
    num: "03",
    title: "煽らない通知",
    body: "1日1通まで。Calm Mode で完全に静かにもできます。",
    accent: "text-acid-lime",
  },
];

export function LearningDesign(): React.ReactElement {
  return (
    <section className="relative py-[80px] lg:py-[120px] bg-electric-blue text-white overflow-hidden">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden="true"
      />

      {/* Acid Lime stripe */}
      <div
        className="absolute top-0 right-0 w-1 h-full bg-acid-lime"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1280px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="mb-16"
        >
          <p className="section-eyebrow text-acid-lime mb-4"># 05 — PHILOSOPHY</p>
          <h2
            className="font-[family-name:var(--font-display)] font-extrabold tracking-tight leading-none"
            style={{ fontSize: "clamp(2rem,5vw,4rem)", letterSpacing: "-0.02em" }}
          >
            煽らない学習が、<br />結局いちばん続く。
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="relative aspect-[4/5] rounded-lg overflow-hidden border border-white/20"
          >
            <Image
              src="/images/scene-calm.png"
              alt="窓辺で静かに学習している様子"
              fill
              sizes="(max-width: 1024px) 90vw, 45vw"
              className="object-cover grayscale contrast-105 brightness-105"
              style={{ mixBlendMode: "luminosity" }}
            />
            <div
              className="absolute inset-0 bg-white/5 pointer-events-none"
              aria-hidden="true"
            />
          </motion.div>

          {/* Principles */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="space-y-10 lg:pt-4"
          >
            {principles.map((p, i) => (
              <motion.div
                key={p.num}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.4, 0, 0.2, 1] }}
                className="flex gap-6 items-start border-b border-white/10 pb-10 last:border-0 last:pb-0"
              >
                <span
                  className="font-[family-name:var(--font-display)] font-extrabold leading-none text-white/20 select-none flex-shrink-0 w-12"
                  style={{ fontSize: "2.5rem" }}
                >
                  {p.num}
                </span>
                <div>
                  <h3 className="font-[family-name:var(--font-display)] font-bold text-xl text-white mb-2">
                    {p.title}
                  </h3>
                  <p className="text-white/65 leading-relaxed">{p.body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
