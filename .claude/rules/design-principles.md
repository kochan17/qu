# Design Principles

> **Qu のデザインは Udemy 風の学習プラットフォーム UI（Material 3 ベースのブルー）。**
> 出典: Stitch プロジェクト `stitch_udemy_design_system`（2026-05-22 採用）。
> 対象: `qu-rails`（Rails 8 + Hotwire の Web）。iOS は Hotwire Native が同じ HTML を WebView で表示するため、設計は「Web 上のこのデザインシステム」を基準にする。`qu-site`（marketing）は別ルール。

## 採用方針（最重要）

- **Udemy 風の学習プラットフォーム UI を、Qu の定額制プロダクトとして再現する。** トップナビ + コンテンツ + ブルーのフッター。コース詳細はリッチなランディング、レッスンは専用プレーヤー。
- **ただし Qu は月額 ¥980 の定額制（受け放題）。** 単品販売型のコマース要素（カート・単品価格・割引率・クーポン・ギフト・FOMO コピー）は再現しない。コース詳細の購入枠は「サブスクリプションに含まれる」「学習を始める」に翻訳する。
- デザイントークンは Material 3 のセマンティック命名（`surface` / `surface-container-*` / `on-surface` / `primary` / `outline` 等）。ボタンの塗りは `brand-blue #0052cc`。
- 値はすべて `qu-rails/app/assets/stylesheets/application.tailwind.css` の `@theme` に集約（Tailwind v4）。view に固定 hex を直書きしない。
- **ライト一本。** 時刻・OS 連動の配色切替はしない。
- React 製コンポーネントライブラリ・SPA フレームワークは載せない。**ERB + Tailwind CSS v4 + Hotwire** で再現する。インライン `<script>` を書かず、対話は Stimulus（`accordion` / `tabs` / `practice` / `flash`）で実装する。
- アイコンは **Material Symbols Outlined** のみ。

## カラー（Material 3 セマンティックトークン）

- **ボタン・主要アクション = `brand-blue #0052cc`。** プライマリ文字・リンク・枠は `primary #003d9b`。
- 背景 = `surface #faf8ff`。コンテンツ面 = `surface-container-lowest #ffffff`。沈み面 = `surface-container` / `-high` / `-highest`。
- フルブリードの帯（コース詳細ヒーロー・フッター・プレーヤーのナビ）= `brand-blue` または `primary`、文字は白。
- テキスト = `on-surface #191b23`（主）／ `on-surface-variant #434654`（副）／ `outline #737685`（淡）。
- 枠線 = `outline-variant #c3c6d6`。
- 完了・チェック = `secondary #006b57`（緑系）。星評価は `tertiary` 系（橙）。
- フィードバック: 正解 = `correct #006b57` / 不正解 = `incorrect #ba1a1a`（それぞれ `-soft` の淡面あり）。
- フォーカス = `focus #0091ff`（キーボード操作時のみ 2px outline）。
- 資格カテゴリカラー = `cert-ip`(青) / `cert-fe`(緑) / `cert-genai`(紫) / `cert-gken`(橙)。
- Tailwind セマンティッククラス経由で使う。固定 hex 直書き禁止。

## タイポグラフィ

- **見出し = `font-headline`（Public Sans）／ 本文 = `font-body`（Inter）／ ラベル・ボタン = `font-label`（Geist）。** 日本語グリフは Hiragino にフォールバック。
- Udemy らしく**見出しは太字（700〜900）**で強く立てる。本文は通常ウェイト。
- スケール: `display-lg`(48) / `headline-lg`(32) / `headline-lg-mobile`(24) / `body-md`(16) / `label-caps`(12・大文字ラベル) + Tailwind 標準サイズ。

## レイアウト

- **標準ページ**: 白い sticky トップナビ（ロゴ・検索・ナビ・アバター）+ コンテンツ + ブルーのフッター。コンテンツは `max-w-7xl` 中央寄せ。フルブリードのヒーロー帯は幅いっぱい、内側に `max-w-7xl`。
- **レッスンプレーヤー**: 独自シェル。`primary` 帯のナビ + 2 ペイン（左 = 動画/本文、右 = コースの内容サイドバー）。標準ヘッダー/フッターは出さない。
- **認証画面**: 独自レイアウト。淡い背景の中央に 1 枚のカード。
- **モバイル**: トップナビは簡略化し、ボトムタブ（マイラーニング / コースを探す / 演習 / 設定）を併用。

## コンポーネント（`application.tailwind.css` に定義）

- **ボタン = `.btn` + バリアント。** 角丸は浅め（4px）・font-weight 700。`.btn-primary`（brand-blue 塗り）／ `.btn-outline`（白地 + `on-surface` 枠）／ `.btn-neutral`（淡グレー面）。修飾 `.btn-sm` `.btn-lg` `.btn-block`。
- **カード = `.card`**（白面 + `outline-variant` 枠 + 角丸 8px）。**コースカード = `.course-card`**（hover で `shadow-raised` に持ち上がる）。
- **角丸は全体に浅い**（Udemy らしい四角め。4〜8px 主体）。
- アコーディオン・タブは Stimulus（`accordion` / `tabs`）で。

## アイコン

- **Material Symbols Outlined のみ**。ヘルパー `icon(name, filled:, css:)`。
- アイコンの背景に色付きの丸を置いてよい（デザインシステムとして許容。`~/.claude/rules/ui-icon-styling.md` の例外条項に該当）。

## モーション

- easing は `--ease-standard`。CSS transition / Turbo のページ遷移で表現。
- **Reduced Motion 必須対応**（CSS で定義済み）。
- 不正解時に shake / 揺れは出さない（Safe Failure Design）。

## コピーライティング（日本語）

**アスピレーショナル形（願望・呼びかけ・提案）で統一。** 断言形・押し付け・煽り・割引マーケコピーは禁止。

- OK: 「学習を始める」「もう少し続けてみよう」「7日続いています」「合格に近づいています」
- NG: 「ストリークが消えそう！」（恐怖煽り）/「87% OFF・残り1日」（FOMO・割引）/「今すぐ買わないと損」（FOMO）
- 感嘆符は 1 コピー最大 1 個。絵文字は UI chrome に使わない。

## コマース表現（定額制プロダクトとしての制約）

Qu は月額 ¥980 の定額制。Udemy 風の見た目を再現する際も次は**作らない**:

- ❌ カート / 単品コース価格（¥1,300 等）/ 取り消し線価格 / 割引率（87% OFF）
- ❌ クーポン・ギフト・「残り◯日」等の購入を急かす表示
- 代わりに「サブスクリプションに含まれています」「学習を始める」で表現する。

## ストリーク・インセンティブ哲学

- ストリークは**正答数**で計測（Mastery-anchored）。アプリ open 回数では計測しない。
- 煽り通知は作らない。休息日 Pause を無料提供。
- **Calm Mode** — リング・通知・演出を全 off にできる。

## してはいけないこと（アンチパターン）

- ❌ React コンポーネントライブラリ／SPA フレームワークの持ち込み
- ❌ view 内のインライン `<script>`（Stimulus を使う）
- ❌ Material Symbols 以外のアイコンセット
- ❌ 固定カラー値の直書き（セマンティックトークンを経由）
- ❌ 時刻・OS 連動の配色切替（light 一本）
- ❌ glass-on-glass の重ね置き／問題文・解説の背後の半透明素材
- ❌ 単品販売型コマース（カート・割引・FOMO）— Qu は定額制
- ❌ 不正解時の shake / 揺れアニメ、進捗バーの後退
- ❌ 煽り・FOMO・断言形コピー、数値マーケコピー（景品表示法リスク）

## 倫理ルーブリック

新機能・新コピーの実装前に `humane-tech-rubric.md` の Four Promises 採点シートを通す。13 点未満は差し戻し。

## 主要参照

- Stitch モック: `stitch_udemy_design_system`（`qu_2` ログイン / `qu_brand_blue` マイラーニング / `qu_it_brand_blue` コース詳細 / `qu_ai_brand_blue` レッスンプレーヤー / `qu_1` カタログ）
- デザイントークン: `qu-rails/app/assets/stylesheets/application.tailwind.css`
- Stitch 向け短縮版: `.stitch/DESIGN.md`
- [humane-tech-rubric.md](humane-tech-rubric.md)
