"use client";

import Image from "next/image";
import { motion } from "motion/react";

const SIGNUP_URL = "https://qu-ez4q.onrender.com/sign_up";

export function Hero(): React.ReactElement {
  return (
    <section
      id="hero"
      className="relative overflow-hidden min-h-screen pt-20 pb-20 bg-surface-mist"
    >
      {/* Background geometric accent — Electric Blue block */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[55vw] h-full bg-electric-blue"
        aria-hidden="true"
      />

      {/* Acid Lime stripe accent */}
      <div
        className="pointer-events-none absolute top-0 right-[55vw] w-[6px] h-full bg-acid-lime"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1280px] px-6 w-full grid lg:grid-cols-2 gap-0 items-stretch min-h-[calc(100vh-5rem)]">
        {/* LEFT: typography on Surface Mist */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="relative z-10 flex flex-col justify-center py-16 pr-12"
        >
          <div className="mb-6">
            <span className="chip chip-active">
              月¥980 · 10日間 無料
            </span>
          </div>

          <h1
            className="font-[family-name:var(--font-display)] font-extrabold tracking-tight text-deep-onyx"
            style={{ fontSize: "clamp(2.5rem,5.5vw,5rem)", lineHeight: 1.0, letterSpacing: "-0.02em" }}
          >
            キャリアを、<br />
            動かす資格を、<br />
            <span className="text-electric-blue">月¥980で。</span>
          </h1>

          <p className="mt-8 text-lg text-on-surface-variant leading-relaxed max-w-md">
            ITパスポート・基本情報技術者・生成AIパスポート・G検定。
            4つの資格を、ひとつの月額で。
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 items-start">
            <a href={SIGNUP_URL} className="btn btn-secondary btn-lg group">
              10日間 無料で試す
              <span
                className="material-symbols-outlined text-xl transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              >
                arrow_forward
              </span>
            </a>
            <a
              href="#content"
              className="btn btn-outline btn-lg"
            >
              中身を見る
            </a>
          </div>

          <p className="mt-6 font-[family-name:var(--font-label)] text-xs text-on-surface-variant/70">
            ご登録時にお支払い情報の入力が必要です。期間中に解約すれば料金は発生しません。
          </p>
        </motion.div>

        {/* RIGHT: photo on Electric Blue */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="relative flex items-end justify-center pb-0"
        >
          <div className="relative w-full max-w-md mx-auto aspect-[4/5] mt-16">
            <Image
              src="/images/hero.png"
              alt="Qu で学ぶ20代女性"
              fill
              priority
              sizes="(max-width: 1024px) 80vw, 40vw"
              className="object-cover object-top"
            />
          </div>

          {/* Stats badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="absolute bottom-12 left-0 bg-white border border-[rgba(32,32,32,0.12)] rounded-lg px-5 py-4 shadow-raised"
          >
            <p className="font-[family-name:var(--font-label)] text-[11px] tracking-widest uppercase text-on-surface-variant mb-1">
              対応資格
            </p>
            <p className="font-[family-name:var(--font-display)] font-extrabold text-3xl text-deep-onyx leading-none">
              4<span className="text-electric-blue">種</span>
            </p>
            <p className="font-[family-name:var(--font-label)] text-[11px] tracking-wider text-on-surface-variant mt-1">
              月¥980 ですべて受け放題
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
