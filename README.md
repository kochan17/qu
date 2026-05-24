# Qu — URI 設計（MVP）

> Qu のすべての URI（Path）をここに集約する。
> Expo Router file-based routing と 1:1 対応。**MVP に必要な URI だけ**を載せる。
> 命名方針: REST 流（複数形リソース指向）/ kebab-case / 動詞は使わない。
> 凡例: ✅ 実装済 / 🟡 部分実装 / 🟠 計画中（未着手）

---

## 1. 全体構成

```
qu-app/                    モバイル + Web（Expo Web）— 学習者 & 運営者の両方をホスト
  └─ /                      認証必須（学習者向け）
  └─ /admin/*               認証必須 + role='admin' （運営者ツール）
  └─ /login /signup ...     未認証許可（認証フロー）
  └─ /onboarding/*          認証済み・初回起動時のみ
  └─ /legal/*               全員可（規約・特商法）
```

学習者 UI と admin UI は **同一の Expo アプリに同居**（Supabase 1 本運用）。
admin は **デスクトップ Web 専用**。学習者 UI は iPad 横持ち最適。

---

## 2. 学習者向け URI

`app/(app)/` 配下。認証必須。タブバーラベルは **ホーム / コース / 演習 / 設定** の 4 つ。

| URI | ファイル | 役割 | 状態 |
|---|---|---|---|
| `/` | `app/(app)/index.tsx` | **ホーム**（ダッシュボード: 朝3問・ストリーク・今日のおすすめ） | ✅ |
| `/courses` | `app/(app)/courses/index.tsx` | コース一覧（4 資格のシェルフ、Apple Books 風） | 🟡 |
| `/courses/:certSlug` | `app/(app)/courses/[certSlug]/index.tsx` | 資格別カリキュラム詳細（セクション・レッスン一覧） | 🟡 |
| `/courses/:certSlug/:lessonSlug` | `app/(app)/courses/[certSlug]/[lessonSlug].tsx` | レッスン本体（Markdown / 動画 / 音声 / 確認問題） | 🟠 |
| `/practice` | `app/(app)/practice/index.tsx` | 演習モード（パーソナライズ出題） | ✅ |
| `/practice/result` | `app/(app)/practice/result.tsx` | 直近の演習結果 | 🟡 |
| `/settings` | `app/(app)/settings.tsx` | アカウント・サブスク管理・退会・Calm Mode トグル | ✅ |

**slug 例**:
- `/courses/fe` — 基本情報技術者
- `/courses/fe/binary-0011` — レッスン「2進数の表現」
- `/courses/genai/llm-basics` — レッスン「LLM の基礎」

---

## 3. 運営者向け URI（Phase 1）

`app/(app)/admin/` 配下。`_layout.tsx` で **role='admin' チェック** → 未権限なら `/` リダイレクト。

| URI | ファイル | 役割 |
|---|---|---|
| `/admin` | `admin/index.tsx` | KPI ダッシュボード（公開コース数 / 公開問題数 / 登録ユーザー数 / 課金中ユーザー数） |
| `/admin/courses` | `admin/courses.tsx` | カリキュラム制作（certifications → courses → sections → lessons + questions の 4 階層編集、3 ペイン） |
| `/admin/team` | `admin/team.tsx` | 運営メンバー管理（招待・一覧・権限剥奪） |

---

## 4. 認証系 URI（未認証許可）

| URI | ファイル | 役割 |
|---|---|---|
| `/login` | `app/login.tsx` | サインイン（Apple / Google / メール） |
| `/signup` | `app/signup.tsx` | 新規登録（メアド + パスワード） |
| `/forgot-password` | `app/forgot-password.tsx` | パスワードリセットメール送信 |
| `/reset-password` | `app/reset-password.tsx` | リセットリンク経由での新パスワード設定（`?token=`） |

`/logout` は URL を持たない（ボタン → `signOut()` → `/login` へリダイレクト）。

---

## 5. オンボーディング（認証済み・初回のみ）

| URI | ファイル | 役割 |
|---|---|---|
| `/onboarding` | `app/onboarding/index.tsx` | 資格選択 + 1 問体験のイントロ |
| `/onboarding/preview` | `app/onboarding/preview.tsx` | 体験問題の解答 |
| `/onboarding/result` | `app/onboarding/result.tsx` | 体験結果 → サブスク誘導 |

---

## 6. 法定ページ（全員可）

| URI | ファイル | 役割 |
|---|---|---|
| `/legal/terms` | `app/legal/terms.tsx` | 利用規約 |
| `/legal/privacy` | `app/legal/privacy.tsx` | プライバシーポリシー |
| `/legal/tokushoho` | `app/legal/tokushoho.tsx` | 特定商取引法に基づく表記 |

App Store / Google Play 申請に必須。

---

## 7. Edge Functions

| エンドポイント | 役割 |
|---|---|
| `POST /functions/v1/stripe-webhook` | Stripe Webhook 受信（サブスク状態同期） |
| `POST /functions/v1/invite-admin` | 運営メンバーを招待（service_role でメール送信 + invitations テーブル更新） |

---

## 8. 認可マトリクス

| URI パターン | 未認証 | role='user' | role='admin' |
|---|:-:|:-:|:-:|
| `/login` `/signup` `/forgot-password` `/reset-password` | ✅ | ✅ | ✅ |
| `/legal/*` | ✅ | ✅ | ✅ |
| `/onboarding/*` | ❌ → `/login` | ✅ | ✅ |
| `/` `/courses/*` `/practice/*` `/settings` | ❌ → `/login` | ✅ | ✅ |
| `/admin/*` | ❌ → `/login` | ❌ → `/` | ✅ |

ガードは 3 層:
1. **クライアント側**: `_layout.tsx` でセッション・role チェック（UX）
2. **DB 側**: 全テーブル RLS、admin 限定 INSERT/UPDATE/DELETE は `profiles.role='admin'` で許可
3. **Edge Function 側**: service_role を必要とする処理は Edge Function 内に閉じ込め

---

## 9. URI 命名ルール

- **複数形**: コレクションリソースは複数形（`/courses` `/admin/team` ※team は集合名詞）
- **kebab-case**: 複合語は `-` 区切り（`/forgot-password` `/binary-0011`）
- **動的セグメント**: `[slug]` は人間可読 slug（uuid は使わない）。`certSlug` は 4 資格の固定 slug（`ip` `fe` `genai` `gken`）
- **動詞を使わない**: リソース指向で統一（旧 `/learn` → `/courses`）
- **ルートグループ `(name)`**: `(app)` は認証必須グループ（URL には出ない）

---

## 10. Future（MVP 外、ローンチ後）

### 学習者
- `/summary` — 弱点サマリー（Fitness 風 3 リング） — MVP は `/` に簡易表示で代用
- `/ai-qa` — AI Q&A（RAG）
- `/audio` — 夜の音声解説クイズ
- `/playground` — 基本情報 科目B 用 Pyodide / WebContainer
- `/bookmarks` — ブックマーク一覧 — MVP は practice / lesson 内のアクションのみ
- `/notebook` — 学習ノート
- `/search` — 横断検索
- `/notifications` — 通知センター — MVP は push 通知のみ
- `/practice/sessions/:id` — 過去の特定セッション結果

### 運営者
- `/admin/customers` — 学習者ユーザー管理（一覧・状況確認・退会対応） — MVP は Stripe Dashboard + Supabase Studio で代用
- `/admin/subscriptions` — サブスク状態観測 — Stripe Dashboard で代用
- `/admin/settings` — 試験日設定・全体お知らせ

### Edge Functions
- `POST /functions/v1/ai-draft-question` — AI で問題ドラフト生成
- `POST /functions/v1/embed-content` — レッスン本文を embedding 化

### その他
- `/study-groups/:id` — 招待制の学習グループ
- `/leaderboard` — opt-in リーダーボード
- que-site の `/` `/pricing` `/blog` `/faq`

---

最終更新: 2026-05-07
