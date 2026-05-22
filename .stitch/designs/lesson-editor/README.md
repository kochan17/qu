# Lesson Editor — Stitch Mockups

Stitch project: `16596896957741615778`
Design system: `assets/17342615687936833569` (shikaq — Apple-native Study)

## Screens

| ファイル | スクリーン ID | 内容 |
|---|---|---|
| `video-tab.png` / `.html` | 2982f7c86200470ab5040c2f12624be5 | エディタ「動画」タブ — 3カラム (シーン一覧 / プレビュー / インスペクター) |
| `markdown-tab.png` / `.html` | c801e76b5196464d93213a371bf4f0cf | エディタ「教材本文」タブ — 2カラム (Markdown エディタ / ライブプレビュー) |
| `quiz-tab.png` / `.html` | b853dbdd1a284b93a51c5a5e8ae40715 | エディタ「確認問題」タブ — 問題リスト + 編集フォーム |
| `publish-tab.png` / `.html` | 9e994505d6fb4601a74b9225673f4035 | エディタ「公開」タブ — チェックリスト + 公開先 + バージョン履歴 |
| `lessons-list.png` / `.html` | d9bdfe6248f54de1977822eb6baca49c | レッスン管理 `/admin/lessons` — サイドバー + Stat 4枚 + 8 行リスト |

## デザイン原則

`.claude/rules/design-principles.md` 参照。

- 1px hairline border (#E5E5EA)、影ゼロ、白カード
- systemBlue (#007AFF) アクセントのみ、systemGreen / systemOrange は status のみ
- アイコンの背景に色付き丸禁止
- JetBrains Mono は数字とコードのみ、本文は Inter / SF Pro
- `.dev/lesson_editor_plan.md` の実装計画と対応
