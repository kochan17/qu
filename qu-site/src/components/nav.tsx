"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const SIGNUP_URL = "https://qu-ez4q.onrender.com/sign_up";
const LOGIN_URL = "https://qu-ez4q.onrender.com/session/new";

export function Nav(): React.ReactElement {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = (): void => setScrolled(window.scrollY > 8);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-200",
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-[rgba(32,32,32,0.1)]"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-[1280px] px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#hero"
          className="font-[family-name:var(--font-display)] font-extrabold text-2xl tracking-tight text-deep-onyx"
        >
          Qu
        </a>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {(["特徴", "対応資格", "料金", "FAQ"] as const).map((label, i) => {
            const hrefs = ["#features", "#certifications", "#pricing", "#faq"];
            return (
              <a
                key={label}
                href={hrefs[i]}
                className="font-[family-name:var(--font-label)] text-xs font-medium tracking-widest uppercase text-on-surface-variant hover:text-deep-onyx transition-colors duration-200"
              >
                {label}
              </a>
            );
          })}
        </nav>

        {/* CTA cluster */}
        <div className="flex items-center gap-3">
          <a
            href={LOGIN_URL}
            className="hidden sm:inline-flex font-[family-name:var(--font-label)] text-xs font-medium tracking-wider uppercase text-on-surface-variant hover:text-deep-onyx transition-colors duration-200 px-3 py-2"
          >
            ログイン
          </a>
          <a
            href={SIGNUP_URL}
            className="btn btn-primary btn-sm"
          >
            無料で試す
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              arrow_forward
            </span>
          </a>
        </div>
      </div>
    </motion.header>
  );
}
