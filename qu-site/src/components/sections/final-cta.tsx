"use client";

import Image from "next/image";
import { motion } from "motion/react";

const SIGNUP_URL = "https://qu-ez4q.onrender.com/sign_up";

export function FinalCTA(): React.ReactElement {
  return (
    <section className="relative py-[80px] lg:py-[120px] overflow-hidden bg-deep-onyx text-white">
      {/* Acid Lime diagonal accent */}
      <div
        className="absolute bottom-0 right-0 w-1/3 h-1 bg-acid-lime"
        aria-hidden="true"
      />
      <div
        className="absolute top-0 left-0 w-1 h-full bg-electric-blue"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1280px] px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <p className="section-eyebrow text-acid-lime mb-4"># 08 — START</p>
            <h2
              className="font-[family-name:var(--font-display)] font-extrabold tracking-tight leading-none mb-8"
              style={{ fontSize: "clamp(2.5rem,6vw,5rem)", letterSpacing: "-0.02em" }}
            >
              今日から、<br />はじめませんか。
            </h2>
            <p className="text-lg text-white/70 max-w-xl leading-relaxed mb-10">
              10日間 無料で試せます。続けたければそのまま、合わなければ解約。それだけ。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <a
                href={SIGNUP_URL}
                className="btn btn-secondary btn-lg group"
              >
                10日間 無料で試す
                <span
                  className="material-symbols-outlined text-xl transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  arrow_forward
                </span>
              </a>
            </div>

            <p className="mt-6 font-[family-name:var(--font-label)] text-[11px] tracking-wider text-white/40 uppercase">
              月¥980 · いつでも解約可能
            </p>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden border border-white/15">
              <Image
                src="/images/scene-cta.png"
                alt="達成感のある表情で学習を終えた様子"
                fill
                sizes="45vw"
                className="object-cover grayscale contrast-105 brightness-105"
                style={{ mixBlendMode: "luminosity" }}
              />
              <div
                className="absolute inset-0 bg-electric-blue/20 pointer-events-none"
                aria-hidden="true"
              />
            </div>

            {/* Floating label */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="absolute -bottom-4 -left-6 bg-acid-lime px-5 py-3 rounded"
            >
              <p className="font-[family-name:var(--font-display)] font-extrabold text-deep-onyx text-lg leading-none">
                ¥980
                <span className="font-[family-name:var(--font-label)] text-xs font-medium tracking-wider ml-2 text-deep-onyx/70">
                  /月
                </span>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
