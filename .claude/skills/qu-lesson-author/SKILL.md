---
name: qu-lesson-author
description: Quの資格教材を自然言語の依頼から作成する。基本情報技術者、生成AIパスポート、G検定などについて「教材を作って」「レッスンにして」「確認問題も作って」「動画教材も作って」と依頼されたら使う。参照資料を探し、Qu形式のテキスト教材、確認問題、必要に応じてHyperFrames動画を生成する。
---

# Qu Lesson Author

自然言語の依頼から、Quで使う教材一式を作る。

## 出力先

資格ごとの `content/<cert>/drafts/` に作る。

```text
content/<cert>/drafts/
  lessons/<lesson-id>.md
  questions/<lesson-id>.md
  videos/<lesson-id>/
    index.html
    <lesson-id>.mp4
```

## 標準ワークフロー

1. ユーザーの依頼から `certification`、`topic`、`level`、`duration_minutes`、`video_required` を決める。
2. `content/<cert>/references/` から関連箇所を検索する。
3. 参考資料はそのまま転用せず、Qu独自の教材本文に再構成する。
4. `templates/lesson.md` の形でレッスンを作る。
5. `templates/questions.md` の形で確認問題を作る。
6. 動画が必要な場合はHyperFramesプロジェクトを `drafts/videos/<lesson-id>/` に作り、音声なしの短尺動画をレンダリングする。

## 教材の品質基準

- 1レッスンは5〜8分で読み切れる粒度にする。
- 初学者向けは、専門用語を出す前に直感的な例を置く。
- 本文は「学習目標 → 解説 → 例 → 要点 → 次に学ぶこと」にする。
- 確認問題は3〜5問。各問に答えと解説を付ける。
- 元資料の言い回しを長くコピーしない。構造と知識を参考にして、表現は作り直す。

## HyperFrames動画

- まず `npx hyperframes init <dir> --example blank` で作る。
- 1920x1080、30秒前後、音声なしを標準にする。
- 画面は3〜4シーンに分ける。
- 1画面に長文を置かず、概念・比較・結論を大きく見せる。
- 作成後は最低限 `npx hyperframes lint` と `npx hyperframes render --output <lesson-id>.mp4` を実行する。

## 必要なもの

- HyperFrames CLI: `npx hyperframes ...` で利用できればよい。
- MP4レンダリングにはFFmpegとChromeが必要。
- 音声付きにする場合だけ、ElevenLabsなどのTTS APIを別途使う。
