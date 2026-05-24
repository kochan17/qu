"use client";

import { motion } from "motion/react";

const lessons = [
  { cert: "iP", certColor: "bg-cert-ip", title: "ストラテジ系：経営戦略", count: 12 },
  { cert: "iP", certColor: "bg-cert-ip", title: "マネジメント系：プロジェクト管理", count: 8 },
  { cert: "FE", certColor: "bg-cert-fe", title: "テクノロジ系：アルゴリズム", count: 16 },
  { cert: "FE", certColor: "bg-cert-fe", title: "テクノロジ系：データベース", count: 10 },
  { cert: "AI", certColor: "bg-cert-genai", title: "生成AIの仕組み", count: 8 },
  { cert: "AI", certColor: "bg-cert-genai", title: "プロンプトエンジニアリング", count: 6 },
  { cert: "G", certColor: "bg-cert-gken", title: "機械学習の基礎", count: 14 },
  { cert: "G", certColor: "bg-cert-gken", title: "ディープラーニング応用", count: 12 },
];

export function ContentGrid(): React.ReactElement {
  return (
    <section id="content" className="relative py-[80px] lg:py-[120px] bg-surface-mist">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid lg:grid-cols-2 gap-8 mb-16 items-end">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <p className="section-eyebrow mb-4"># 04 — INSIDE</p>
            <h2
              className="font-[family-name:var(--font-display)] font-extrabold tracking-tight text-deep-onyx leading-none"
              style={{ fontSize: "clamp(2rem,5vw,4rem)", letterSpacing: "-0.02em" }}
            >
              中身を、先に<br />見てください。
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="text-lg text-on-surface-variant leading-relaxed max-w-md"
          >
            動画と音声、両方で学べます。通勤中も、机に向かう時間も。
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {lessons.map((lesson, i) => (
            <motion.div
              key={lesson.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: [0.4, 0, 0.2, 1] }}
              className="card group cursor-default"
            >
              {/* Thumbnail */}
              <div className={`${lesson.certColor} aspect-video relative flex items-center justify-center rounded-t-lg overflow-hidden`}>
                <span className="material-symbols-outlined text-5xl text-white/80" aria-hidden="true">
                  play_circle
                </span>
                <span className="absolute top-3 left-3 font-[family-name:var(--font-label)] text-[11px] font-medium tracking-widest uppercase text-white bg-black/20 rounded px-2 py-1">
                  {lesson.cert}
                </span>
              </div>

              <div className="p-4">
                <h3 className="font-[family-name:var(--font-display)] font-semibold text-sm text-deep-onyx line-clamp-2 min-h-[2.5rem] leading-snug">
                  {lesson.title}
                </h3>
                <p className="mt-2 font-[family-name:var(--font-label)] text-[11px] tracking-wider text-on-surface-variant">
                  全 {lesson.count} レッスン
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
