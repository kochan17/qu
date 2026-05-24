export function Footer(): React.ReactElement {
  return (
    <footer className="bg-deep-onyx text-white/70 py-16">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <p className="font-[family-name:var(--font-display)] font-extrabold text-2xl text-white">
              Qu
            </p>
            <p className="mt-2 text-sm text-white/50">
              月¥980 で IT・AI 資格が学び放題。
            </p>
          </div>
          <div>
            <p className="font-[family-name:var(--font-label)] text-[11px] font-medium tracking-[0.12em] uppercase text-white/40 mb-4">
              サービス
            </p>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors duration-200">特徴</a></li>
              <li><a href="#certifications" className="hover:text-white transition-colors duration-200">対応資格</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors duration-200">料金</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors duration-200">FAQ</a></li>
            </ul>
          </div>
          <div>
            <p className="font-[family-name:var(--font-label)] text-[11px] font-medium tracking-[0.12em] uppercase text-white/40 mb-4">
              会社
            </p>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors duration-200">運営者情報</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">お問い合わせ</a></li>
            </ul>
          </div>
          <div>
            <p className="font-[family-name:var(--font-label)] text-[11px] font-medium tracking-[0.12em] uppercase text-white/40 mb-4">
              法務
            </p>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors duration-200">利用規約</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">プライバシーポリシー</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">特定商取引法に基づく表記</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="font-[family-name:var(--font-label)] text-[11px] tracking-wider text-white/30">
            © 2026 Qu. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-acid-lime" />
            <span className="font-[family-name:var(--font-label)] text-[11px] tracking-wider text-white/30 uppercase">
              月¥980 · IT/AI 資格 学び放題
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
