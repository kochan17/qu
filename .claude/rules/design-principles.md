# Design Principles

> **Que のデザインは Apple 純正アプリに全振り。「Apple が資格学習アプリを作ったらこうなる」が唯一のゴール。**
> 対象: `qu-rails`（Rails 8 + Hotwire の Web）。iOS は Hotwire Native が同じ HTML を WebView シェルで表示するため、**設計は「iPad Safari 上の Apple 品質 Web」を基準にする**。`qu-site`（marketing）は別ルール。

## 核となる哲学（Apple HIG Foundations）

- **Clarity** — コンテンツ（問題文・選択肢）が主役。装飾的な影・グラデーション・枠線を排除
- **Deference** — UI は引き算。ナビゲーションは半透明素材でコンテンツに道を譲る
- **Depth** — 階層を Z 軸で表現。`backdrop-filter` で層を分離
- **Less but better** — 1 画面 1 情報。問題画面に出すのは「問題文 / 選択肢 / 残り問題数」のみ
- 参照: https://developer.apple.com/design/human-interface-guidelines/foundations

## タイポグラフィ

- **システムフォントスタック `-apple-system`**（Tailwind の `font-sans`）。iPad / Mac Safari・iOS の WebView では自動的に **SF Pro** が使われる。日本語は Hiragino Sans に自動フォールバック
- **ブラウザのフォントサイズ設定を尊重**。`rem` ベースで組み、固定 px で本文を縛らない
- 階層: 見出し（問題番号・セクション）/ 本文（問題文）/ 選択肢 / 解説 / 補足 — Tailwind のサイズトークンで段階を作る

## アイコン

- **Material Symbols のみ使用**（Web フォント）。他のアイコンセット禁止
- 隣接テキストと光学的な重さを揃える（サイズ・ウェイトを本文に同期）
- アイコンの背景に色付きの丸／角丸アクセントを置かない（`~/.claude/rules/ui-icon-styling.md`）

## カラー

- **セマンティックトークンを Tailwind の `@theme` で定義**して使う。固定 hex の直書き禁止
- ライト / ダークは CSS `prefers-color-scheme` で自動切替（時刻連動の背景色変化は禁止）
- フィードバック: 正解＝グリーン系 / 不正解＝レッド系のセマンティックトークン
- アクセント: tint を 1 色。資格ごとのカテゴリカラーは背景に淡く滲ませる（Apple Music 方式）
- コントラスト基準: 通常 4.5:1、大テキスト 3:1（ライト / ダーク両方で検証）

## モーション

- **CSS transition / View Transitions / Turbo のページ遷移**で表現。spring 的な弾みは `cubic-bezier` で
- **Reduced Motion 必須対応** — `@media (prefers-reduced-motion: reduce)` でフェードに切替
- **触覚フィードバック** — Web では原則なし。iOS（Hotwire Native）でのみ Bridge Component 経由で付与。
  不正解時は warning 相当（error 相当は使わない — 心理的安全性、ペナルティ感の回避）

## 素材（Liquid Glass 風）

- CSS `backdrop-filter: blur()` + 半透明背景で近似。Safari / Chrome で動作、Firefox はフォールバック（半透明・影なし）
- **適用は chrome のみ**（ヘッダー / ナビ / ツールバー / シート）
- **絶対避ける場所**: 問題文・解説の背景（NN/g 報告で 15% time-on-task regression、可読性が壊れる）
- ガラス要素の重ね置き（glass-on-glass）厳禁

## ナビゲーション

- **iPad 横持ち**: 資格 → コース/セクション → 問題/レッスン の 3 カラムを **CSS グリッドで実装**（Hotwire Native はネイティブ SplitView 非対応のため、Web レイアウトで再現する）
- **iPad 縦持ち / スマホ**: カラムが段組み or タブ的に畳まれるレスポンシブ挙動
- **キーボードショートカット**（iPad 外付けキーボード）: 問題送り / 1〜4 で選択肢 / 上下でフォーカス — Stimulus で実装
- **ポインタ対応**: 選択肢は hover で軽い lift + highlight

## 画面 × 純正アプリ マッピング

| Que の画面 | 参照する純正アプリ | 転用する要素 |
|---|---|---|
| Today ダッシュボード | Apple News+ × Fitness | フルブリード Featured + Daily Ring |
| 資格選択 / コース一覧 | Apple Books | 横スクロールシェルフ + カバー主体カード |
| セクション / レッスン一覧 | Apple Podcasts | エピソードカード + 進捗バー + 状態バッジ |
| 問題演習（集中） | Journal | 余白最大 + 問題文中央配置 + ツールバー最小 |
| 学習サマリー・弱点 | Fitness | リング + ストリーク |
| Playground（基本情報 科目B） | Swift Playgrounds | 左エディタ / 右結果 / 実行ボタン |

## コピーライティング（日本語）

**アスピレーショナル形（願望・呼びかけ・提案）で統一。** 断言形・押し付け・煽りは禁止。

- OK: 「今日の3問が届きました」「もう少し続けてみよう」「7日続いています」「合格に近づいています」
- NG: 「私は毎日学ぶ人だ」（断言形）/「ストリークが消えそう！」（恐怖煽り）/「今すぐ学習しないと損する」（FOMO）
- Tone: 「スタバで一緒に勉強しよう」的な仲間感。一人称は使わない。感嘆符は 1 コピー最大 1 個。絵文字は使わない

## ストリーク・インセンティブ哲学（譲れないライン）

- **Mastery-anchored で計測** — ストリークは**正答数**で計測。レッスン起動回数・アプリ open 回数では計測しない
- **継続中はストリークを大きく見せない**。終了時にだけ自己ベスト更新を称える（Apple Fitness 流）
- **休息日 Pause を最初から無料提供**。Streak Freeze は手動消費がデフォルト、自動消費時は事後通知で透明化
- **煽り通知禁止** — 「ストリークが消えそう！」型は絶対に作らない
- **Calm Mode を初期から構造的に持つ** — 試験前にリング・通知・バッジ・演出を全 off にできる

## してはいけないこと（アンチパターン）

- ❌ React / SPA フレームワークやそのコンポーネント群を持ち込む（Hotwire 構成と戦う）
- ❌ Material Symbols 以外のアイコンセット
- ❌ 装飾的な影・グラデーション・枠線
- ❌ Duolingo 風のキャラクター・イラスト主導デザイン
- ❌ Udemy 風の情報密度（サイドバー詰込み・多数アクション同時表示）
- ❌ スタディサプリ風の「教育サービス感」（青×白の硬いトンマナ）
- ❌ 固定カラー値の直書き（セマンティックトークンを経由する）
- ❌ 時刻連動の背景色変化（`prefers-color-scheme` を尊重）
- ❌ 学習プロセスの公開 SNS シェア強要（合格結果のシェアは OK）
- ❌ 不正解時の shake / 揺れアニメ
- ❌ 進捗バーの後退（Safe Failure Design）
- ❌ 匿名ソーシャルグループ・自動マッチング（招待制のみ）
- ❌ 「200-300% 改善」等の数値マーケコピー（景品表示法リスク）

## 倫理ルーブリック

新機能・新コピーの実装前に `humane-tech-rubric.md` の Four Promises 採点シートを通す。
13 点未満は PR レビューで差し戻し or 設計再考。

## 主要参照

- [HIG Foundations](https://developer.apple.com/design/human-interface-guidelines/foundations)
- [Designing for iPadOS](https://developer.apple.com/design/human-interface-guidelines/designing-for-ipados)
- [NN/g — Liquid Glass](https://www.nngroup.com/articles/liquid-glass/)
