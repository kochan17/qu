# DB Schema Overview

**DB**: PostgreSQL 16 + pgvector（**単一データベース**。Solid Cache/Queue/Cable も同居）。
**ORM**: Active Record（Rails 8）。マイグレーション置き場: `qu-rails/db/migrate/`。
**認可**: RLS は使わない。**Pundit ポリシー**（`qu-rails/app/policies/`）で代替。
**詳細設計**: `.dev/設計書_DBスキーマ_Qu.md`（v3 — 全テーブルのカラム・型・制約・インデックス）。

## 設計原則

- 主キーは **bigint `id`**（Rails デフォルト）。UUID は使わない。
- enum は **string + DB CHECK 制約** + Rails `enum`。PostgreSQL native enum は使わない。
- **全外部キーにインデックス**。
- 固定深さの階層は**別テーブル + 外部キー**（自己参照ツリーにしない）。
- **YAGNI** — 使わないテーブル・カラムを先回りで作らない。機能の実装時に一緒に追加する。
- DB 制約（NOT NULL / unique / CHECK / FK）とモデルバリデーションを両方持つ。
  ただし DB デフォルト列（`created_at` 等）に presence バリデーションは付けない。

## コアテーブル（実装済み）

- **users** — Rails 8 標準認証（`email_address` / `password_digest`）+ プロフィール + ストリークを 1 テーブルに統合。`role` enum（user / admin）
- **sessions** — Rails 8 標準認証のセッション
- **subscriptions** — Stripe サブスク状態（status / source / stripe_* / current_period_end）
- **certifications → courses → sections → lessons → questions** — コンテンツ階層（4 段の別テーブル + 問題）。`lessons.content_type` / `lessons.video_status`、`questions.format` / `status`、`questions.choices` は jsonb
- **quiz_results** — 解答履歴
- **lesson_completions** — レッスン完了（旧 progress）
- **question_review_states** — FSRS-5 の per-user/per-question 状態
- **daily_activities** — Daily Ring。`completed` は生成列（STORED、復習 + 新規の正答数で判定）

加えて Active Storage 3 テーブル、Solid Cache/Queue/Cable のテーブル。
レッスンの動画・画像は Active Storage 添付（`Lesson` の `has_one_attached :video` / `has_many_attached :images`）。

> **2026-05-23 整理**: 未実装で未使用だった `notifications` / `section_masteries` テーブル、
> `users.avatar_url`、`daily_activities` の audio 列を削除（UI ドリブンの再設計）。

## 後で追加するテーブル（機能と同時・YAGNI）

bookmarks / annotations（highlight・pin・ink を kind enum で統合）/ annotation_events / content_versions / embeddings（pgvector・RAG）/ ai_qa_histories / invitations

## Pundit 認可パターン

| パターン | 対象 | ポリシー |
|---|---|---|
| 自分のデータのみ | quiz_results, lesson_completions, question_review_states, daily_activities, subscriptions(read) | `record.user_id == user.id` |
| 公開コンテンツは全員 read | certifications, courses, sections, lessons, questions | `published` スコープ |
| admin 限定の write | 上記コンテンツ系の作成・更新・削除 | `user.admin?` |

基底ポリシー: `OwnedRecordPolicy` / `PublicContentPolicy`。
運営者向けカリキュラム管理は `Admin::` 名前空間（`Admin::BaseController` が admin ロールを要求）。

## 規約

- スキーマ変更は `bin/rails g migration <name>` → `bin/rails db:migrate`。`schema.rb` を手書きしない。
- トリガー / RPC は使わず、モデルのコールバック・メソッドで表現する。
  ただし別モデルを生成する cross-model 副作用 callback は避ける（コントローラ / サービスへ）。
