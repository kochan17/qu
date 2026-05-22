# Architecture — Que monorepo

モノレポ。主プロダクトは `qu-rails`。他はそれを支える周辺サービス・資産。
プロジェクト概要は `CLAUDE.md`、Expo→Rails 移行の経緯は `.dev/移行計画_Railsピボット_Que.md`。

## パッケージ

| ディレクトリ | 役割 | 技術 | 状態 |
|---|---|---|---|
| `qu-rails/` | 学習者 UI + Admin LMS。**プロダクト本体** | Rails 8 + Hotwire | 稼働中（Render） |
| `qu-site/` | ランディングページ（marketing） | Astro | 別運用 |
| `renderer/` | 動画レッスンのレンダラ | Hono + Remotion（Node） | qu-rails から HTTP 起動（Block D で連携） |
| `content/` | 学習コンテンツ原稿（Markdown） | — | qu-rails の seed ソース |
| `e2e/` | ブラウザ E2E テスト | Playwright | |
| `.claude/` | エージェント設定（rules / agents / skills） | — | |
| `.dev/` | 設計・計画ドキュメント | — | gitignore |
| `.stitch/` `.aidesigner/` | デザイン資産 | — | 参照用 |
| `qu-app/` `shikaq-app-legacy/` `supabase/` `maestro/` | 旧 Expo アプリ・Supabase 環境 | — | **レガシー・撤去予定** |

## 制御 / データフロー

```
  学習者・運営者
      │  HTTP（Web ブラウザ / Hotwire Native iOS シェル — 同じ HTML）
      ▼
  ┌─────────────────────────────┐
  │  qu-rails（Rails 8 + Hotwire）│
  │  ・学習者 UI / Admin LMS      │
  │  ・Pundit 認可               │
  └──────────────┬──────────────┘
                 │
   PostgreSQL 16（単一 DB / pgvector / Solid Queue・Cache・Cable 同居）
                 │
   Solid Queue ジョブ ──→ renderer（動画レンダリング）/ AI 等（Block D 以降）

  content/（Markdown） ── seed / rake ──→ qu-rails の DB
```

- ブラウザと Hotwire Native iOS シェルは**同じ Rails 配信の HTML** を表示する（画面実装は 1 ソース）。
- Solid Queue / Cache / Cable は primary データベースに同居（単一 DB 構成）。

## ビルド・デプロイ

- **qu-rails** — Rails 8 標準 Dockerfile で Docker ビルド → **Render**。`main` への push で自動デプロイ。
  起動時に entrypoint が `db:prepare` → `db:seed` を実行。
- **qu-site** — Astro（デプロイ先未定）。
- パッケージ間に共有ビルド依存はない（各々独立してビルドする）。

## 外部サービス

| サービス | 用途 |
|---|---|
| Render | ホスティング（Web）+ PostgreSQL |
| Stripe | 決済（月額サブスク）/ Apple IAP は iOS 側 |
| Cloudflare R2 | Active Storage（音声・動画・サムネ、予定） |
| Sentry | エラー監視（予定） |

## ローカル開発

`qu-rails/` で `docker compose up -d`（OrbStack 上の PostgreSQL + pgvector、ポート 5433）→ `bin/dev`。
詳細は `CLAUDE.md` の「開発」セクション。
