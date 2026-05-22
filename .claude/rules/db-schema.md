# DB Schema Overview

**DB**: PostgreSQL 16 + pgvector（**単一データベース**。Solid Cache/Queue/Cable も同居）。
**ORM**: Active Record（Rails 8）。マイグレーション置き場: `qu-rails/db/migrate/`。
**認可**: RLS は使わない。**Pundit ポリシー**（`qu-rails/app/policies/`）で代替。
**詳細設計**: `.dev/設計書_DBスキーマ_Que.md`（v3 — 全テーブルのカラム・型・制約・インデックス）。

## 設計原則

- 主キーは **bigint `id`**（Rails デフォルト）。UUID は使わない。
- enum は **string + DB CHECK 制約** + Rails `enum`。PostgreSQL native enum は使わない。
- **全外部キーにインデックス**。
- 固定深さの階層は**別テーブル + 外部キー**（自己参照ツリーにしない）。
- **YAGNI** — 使わないテーブル・カラムを先回りで作らない。機能の実装時に一緒に追加する。
- DB 制約（NOT NULL / unique / CHECK / FK）とモデルバリデーションを両方持つ。
  ただし DB デフォルト列（`created_at` 等）に presence バリデーションは付けない。

## コア 13 テーブル（実装済み）

- **users** — Rails 8 標準認証（`email_address` / `password_digest`）+ プロフィール + ストリークを 1 テーブルに統合。`role` enum（user / admin）
- **sessions** — Rails 8 標準認証のセッション
- **subscriptions** — Stripe サブスク状態（status / source / stripe_* / current_period_end）
- **certifications → courses → sections → lessons → questions** — コンテンツ階層（4 段の別テーブル + 問題）。`lessons.content_type`、`questions.format` / `status`、`questions.choices` は jsonb
- **quiz_results** — 解答履歴
- **lesson_completions** — レッスン完了（旧 progress）
- **question_review_states** — FSRS-5 の per-user/per-question 状態
- **daily_activities** — Daily Ring。`completed` は生成列（STORED）
- **section_masteries** — 80% 習熟ゲート用スコア
- **notifications** — 通知

加えて Active Storage 3 テーブル、Solid Cache/Queue/Cable のテーブル（`create_solid_tables` マイグレーション）。

## 後で追加する 10 テーブル（機能と同時・YAGNI）

bookmarks / annotations（highlight・pin・ink を kind enum で統合）/ annotation_events / content_versions / embeddings（pgvector・RAG）/ ai_qa_histories / lesson_projects / lesson_scenes / lesson_render_jobs / invitations

## Pundit 認可パターン

| パターン | 対象 | ポリシー |
|---|---|---|
| 自分のデータのみ | quiz_results, lesson_completions, question_review_states, daily_activities, section_masteries, notifications, subscriptions(read) | `record.user_id == user.id` |
| 公開コンテンツは全員 read | certifications, courses, sections, lessons, questions | `published` スコープ |
| admin 限定の write | 上記コンテンツ系の作成・更新・削除 | `user.admin?` |

基底ポリシー: `OwnedRecordPolicy` / `PublicContentPolicy`。

## 規約

- スキーマ変更は `bin/rails g migration <name>` → `bin/rails db:migrate`。`schema.rb` を手書きしない。
- トリガー / RPC は使わず、モデルのコールバック・メソッドで表現する。
  ただし別モデルを生成する cross-model 副作用 callback は避ける（コントローラ / サービスへ）。
