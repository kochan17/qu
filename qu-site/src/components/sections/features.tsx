"use client";

import Image from "next/image";
import { motion } from "motion/react";

const features = [
  {
    num: "01",
    title: "4資格\n受け放題",
    body: "ITパスポート・基本情報・生成AIパスポート・G検定。すべて月¥980 の中。1つ受かったら、次へ。",
    image: "/images/scene-allyou.png",
    alt: "受け放題 — 机に本とタブレットを広げている様子",
  },
  {
    num: "02",
    title: "動画も、\n音声も。",
    body: "通勤中はスマホで音声解説、席についたら動画でじっくり。隙間時間を学習に変えられます。",
    image: "/images/scene-audio.png",
    alt: "通勤中にイヤホンで音声学習している様子",
  },
  {
    num: "03",
    title: "続けやすい\n学習設計",
    body: "復習を自動で出題。進捗が見えて、ストリークで習慣化。煽らないペース管理。",
    image: "/images/scene-focus.png",
    alt: "机で集中して書いている様子",
  },
];

export function Features(): React.ReactElement {
  return (
    <section id="features" className="relative py-[80px] lg:py-[120px] bg-pure-white overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="mb-20"
        >
          <p className="section-eyebrow mb-4"># 02 — WHY</p>
          <h2
            className="font-[family-name:var(--font-display)] font-extrabold tracking-tight text-deep-onyx leading-none"
            style={{ fontSize: "clamp(2rem,5vw,4rem)", letterSpacing: "-0.02em" }}
          >
            分厚い参考書では、<br />辿り着けない場所へ。
          </h2>
        </motion.div>

        <div className="space-y-[80px] lg:space-y-[120px]">
          {features.map((feature, i) => {
            const isEven = i % 2 === 1;
            return (
              <motion.div
                key={feature.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${isEven ? "lg:grid-flow-dense" : ""}`}
              >
                {/* Image block */}
                <div
                  className={`relative aspect-[4/5] rounded-lg overflow-hidden border border-[rgba(32,32,32,0.08)] ${isEven ? "lg:col-start-2" : ""}`}
                >
                  <Image
                    src={feature.image}
                    alt={feature.alt}
                    fill
                    sizes="(max-width: 1024px) 90vw, 45vw"
                    className="object-cover grayscale contrast-105 brightness-105"
                    style={{ mixBlendMode: "multiply" }}
                  />
                  {/* Blue tint overlay */}
                  <div
                    className="absolute inset-0 bg-electric-blue/10 pointer-events-none"
                    aria-hidden="true"
                  />
                </div>

                {/* Text block */}
                <div className={isEven ? "lg:col-start-1 lg:row-start-1" : ""}>
                  <p
                    className="font-[family-name:var(--font-display)] font-extrabold leading-none text-electric-blue/15 select-none mb-4"
                    style={{ fontSize: "clamp(4rem,10vw,8rem)", letterSpacing: "-0.02em" }}
                  >
                    {feature.num}
                  </p>
                  <h3
                    className="font-[family-name:var(--font-display)] font-extrabold tracking-tight text-deep-onyx leading-none whitespace-pre-line"
                    style={{ fontSize: "clamp(1.75rem,3.5vw,3rem)", letterSpacing: "-0.02em" }}
                  >
                    {feature.title}
                  </h3>
                  <p className="mt-6 text-lg text-on-surface-variant leading-relaxed max-w-md">
                    {feature.body}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
