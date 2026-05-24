# Qu — iPad 中心の資格学習サブスク

**Material 3 ベースのブルーのデザインシステム**（Stitch モック準拠）を基準にする、iPad / タブレット中心の資格学習サブスク。月額 ¥980。**Rails 8 + Hotwire** の Web アプリとして実装し、iOS は **Hotwire Native** で App Store にも出す。

## ⚠️ 移行ステータス（最重要・最初に読む）

本リポジトリは **Expo/React Native + Supabase → Rails 8 + Hotwire への全面移行中**（2026-05-22 開始）。

- **現行アプリ = `qu-rails/`**（Rails 8）。**新規作業はすべてここ。** 本番稼働: https://qu-ez4q.onrender.com
- **レガシー（撤去予定・参照も流用もしない）**: `qu-app/`（旧 Expo）/ `shikaq-app-legacy/` / `supabase/` / `maestro/`
- 移行計画: `.dev/移行計画_Railsピボット_Qu.md` ／ DB 設計: `.dev/設計書_DBスキーマ_Qu.md`

## See Also

- モノレポ構成: `ARCHITECTURE.md`
- **Rails 開発規約（グローバル・必読）**: `~/.claude/rules/rails-conventions.md`
- デザイン原則: `.claude/rules/design-principles.md`
- DB スキーマ: `.claude/rules/db-schema.md`
- 倫理ルーブリック: `.claude/rules/humane-tech-rubric.md`（新機能・新コピーは PR レビュー時に通す）
- **セキュリティ境界（AI 含む全エージェント遵守）**: `.claude/rules/security-boundaries.md`
- Phase 1 確定仕様: `.dev/quiet_streak_lite_v4.md`（学習ループの North Star）

## ターゲットユーザー

**メイン: 20代女性、キャリアアップ志向、スタバで参考書を広げるタイプ**
- **iPad / タブレット中心**、スマホ併用。PC はサブ
- 分厚い参考書に挫折 / Udemy に到達しない層を拾う。対抗軸は Udemy ではなく**市販の分厚い参考書**
- UI 判断は「iPad 横持ち・カフェで片手」を基準にする

## 対象資格（現時点で4種・可変）

ITパスポート（`ip`）／ 基本情報技術者（`fe`）／ 生成AIパスポート（`genai`）／ G検定（`gken`）

> 応用情報・秘書検定・SPI・簿記2級はスコープ外。対象資格は固定でなく今後追加・入替の可能性あり。

## Stack（qu-rails）

Ruby 3.4 / Rails 8.1 / Hotwire（Turbo + Stimulus）/ Tailwind CSS v4 / esbuild / PostgreSQL 16 + pgvector / Pundit / Solid Queue・Cache・Cable（単一 DB）。**認証は Rails 8 標準ジェネレータ**（Devise 不使用）。決済 Stripe。iOS は Hotwire Native。デプロイ Render。

思想・規約の詳細は `~/.claude/rules/rails-conventions.md`。バージョン等の機械的情報は `qu-rails/Gemfile` 参照。

## Workspace Layout（monorepo）

```
qu/
├── qu-rails/   # Rails 8 アプリ本体（学習者 UI + Admin LMS）← 新規作業はここ
├── qu-site/    # ランディングページ（Next.js 16 + Tailwind v4 + Framer Motion）
├── renderer/   # 動画レッスンのレンダラ（Hono + Remotion、別 Node サービス）
├── content/    # 学習コンテンツ原稿（Markdown、seed のソース）
├── e2e/        # ブラウザ E2E（Playwright）
├── .claude/rules/ # ドメイン固有ルール
└── .dev/       # 設計・計画ドキュメント（gitignore）
```

詳細は `ARCHITECTURE.md`。

## 開発（qu-rails）

```bash
cd qu-rails
docker compose up -d        # ローカル PostgreSQL + pgvector（OrbStack 上）
bin/rails db:prepare        # スキーマ構築 + seed
bin/dev                     # Rails + Tailwind watch + esbuild watch
bin/rails db:seed           # サンプル教材を再投入（冪等）
```

開発ユーザー（seed 投入）: `user@que.test` / `admin@que.test`（いずれも password `password1234`）。
`main` への push で Render に自動デプロイ。

## コンテンツ運用（アプリ内 Admin LMS）

Qu は**アプリ内に運営者向け admin ページを持つシンプルな LMS**。外部 CMS は使わない。

```
admin ロールのユーザーがログイン → Admin メニューから:
  資格 / コース / セクション / レッスン（Markdown 本文）/ 問題 を編集
  → is_published / status='published' を on にすると学習者画面に反映
```

問題作成は AI draft 生成 → 運営者校閲 → published も将来導入。著作権配慮：参考書の原文は使わず、運営者が自分の言葉で書いた本文・問題のみ公開する。

## Key Conventions

- **Rails Way 厳守** — `~/.claude/rules/rails-conventions.md` に従う。Rails らしくない実装はしない。凝った設計より素直に
- **認証** — Rails 8 標準（`bin/rails generate authentication`）。Devise 等の認証 gem は入れない
- **認可** — Pundit（自分のデータ / 公開コンテンツ / admin 限定）。`app/policies/`
- **DB** — 単一 PostgreSQL。bigint 主キー。enum は string + CHECK 制約。詳細は `.claude/rules/db-schema.md`
- **フロント** — Hotwire（Turbo / Stimulus）。React 等の SPA フレームワークは持ち込まない
- **デザイン** — `.claude/rules/design-principles.md`（Material 3 ベースのブルー・Stitch モック準拠、tokens + 仕様を ERB/Tailwind で再現、light 一本）
- **アイコン** — Material Symbols のみ。他のアイコンセット禁止
- **コピー（日本語）** — アスピレーショナル形のみ。断言形・煽り・FOMO 禁止
- **ストリーク** — Mastery-anchored（正答数で計測。レッスン起動回数では計測しない）
- **決済** — Stripe（Web）/ Apple IAP（iOS、Hotwire Native の Bridge Component）。月額 ¥980
- **gem** — 足し算しない。まず Rails 標準で解決。追加は理由を添えてユーザー確認
- **倫理** — 新機能・新コピーは `humane-tech-rubric.md` の Four Promises を通す（13点未満は差し戻し）

## Anti-Patterns

| 禁止 | 理由 | 代わりに |
|---|---|---|
| React / SPA フレームワークの持ち込み | Hotwire 構成と戦う | Turbo + Stimulus |
| 認証 gem（Devise 等）の追加 | Rails 8 に標準認証がある | `bin/rails generate authentication` |
| cross-model 副作用を持つ model callback | 追えない副作用 | コントローラ / サービス |
| 固定深さ階層の自己参照ツリー化 | 過剰設計 | 別テーブル + 外部キー |
| React コンポーネントライブラリ / 非商用ライセンスのアイコンセットの使用 | Hotwire 構成・商用ライセンスと不適合 | tokens + 仕様を ERB/Tailwind 再現、アイコンは Material Symbols Outlined |
| 煽り・FOMO・断言形コピー | 倫理ルーブリック違反 | アスピレーショナル形 |
| レガシー（`qu-app` 等）のコード流用 | 移行で撤去する | `qu-rails` で作り直す |
