---
name: educational-narration
description: >
  Write Japanese narration scripts for educational/explanatory videos that
  pair with on-screen visuals. Apply Mayer's multimedia learning principles,
  pace by NHK's 1分300字 standard, and produce TTS-ready text optimized for
  ElevenLabs (multilingual_v2 / v3). Use whenever you need to add voiceover
  to a video lesson — exam prep, technical concept, math walkthrough, etc.
---

# Educational Narration Skill

> 教育動画の音声ナレーション台本を、根拠ある原則に基づいて作るスキル。
> 「画面と音声の役割を分けて、学習者の認知負荷を最小に」が核。

## このスキルを使うタイミング

- HyperFrames など動画 composition に音声をつける時
- e-learning コンテンツの台本を書く時
- 技術解説・資格学習・数学/科学コンテンツの語りを設計する時
- 既存スクリプトを「読み上げに耐える」形に直す時

---

## 1. 黄金ルール（Top of Mind）

**1分あたり 300 字。1文 45 字以内。1文 1 情報。**

- これを守れば視聴者の作業記憶が枯渇しない
- 書いたら声に出して読む。10 秒以上かかる文は分割する
- 英語スクリプトの和訳は文字数が約 1.5 倍に増える点に注意

| 場面 | 目安 |
|---|---|
| NHK ニュース標準 | 300〜350 字/分 |
| 教育ナレーション推奨 | **300 字/分** |
| 民放ナレーション | 360〜400 字/分（速め）|

---

## 2. 認知負荷を下げる 6 原則（Mayer）

### 2-1 モダリティ原則

動く図解の説明は **音声で**。画面に長文テキストを出して読ませない。
視覚と聴覚は独立チャンネルなので両方使うとスループットが倍になる。

### 2-2 冗長性原則（最重要）

**画面テキスト = 音声と完全一致 → NG**（読みと聞きで認知衝突）
**画面テキスト = ナレーションを少し言い換えた補足 → 最善**（保持・転移ともに有利）

ルール:
- 画面はキーワード・数式・図ラベルだけにする
- 音声は「なぜ」「何が起きているか」「文脈」を語る
- 画面の文字をそのまま読み上げない。役割を分ける

### 2-3 セグメンテーション原則

- 動画は 6 分以内（PMC 2016: 9分超で完視率 50% 以下）
- 概念の切り替わりで「では、次に〜」と区切る
- 1 概念 = 1 シーン

### 2-4 シグナリング原則

「ここがポイントです」「注目してください」と **声で予告してから** 画面の矢印・ハイライトを出す。
初学者ほど効く。

### 2-5 事前提示原則（Pre-Training, d=0.85）

新概念は **「名前 → 定義 → 仕組み → 具体例」** の順。
既知の概念から橋を架けて未知へ進む。

### 2-6 時間的近接性

ナレーションと該当の画面要素を **同時** に出す。
図を出してから後で説明する／先に説明してから図を出す、はどちらも効果が落ちる。

---

## 3. 概念提示の順序

```
既知の具体例 → 課題・問い → 新しい概念（名前+定義）→ 仕組み → 別の具体例 → まとめ
```

3Blue1Brown 流の「先にビジュアル・問いを見せて視聴者に考えさせる」も効果的。
資格学習では「試験ではこう問われます」から入って答えを一緒に導くスタイルがハマる。

---

## 4. 接続詞テンプレート（計算・論理を繋ぐ）

| タイミング | 使う | 避ける |
|---|---|---|
| 変数・前提を導入 | 「ここで〜とします」「まず、〜があります」 | 「設〜」（書き言葉）|
| 式を変形 | 「両辺を〜で割ると」「展開すると」 | 「変形して」（曖昧）|
| 結果を示す | 「すると」「これで」 | 「故に」「∴」（記号は読まない）|
| 理由を説明 | 「なぜなら」「というのも」 | 「何故なら」（堅い）|
| まとめ | 「つまり」「要するに」「言い換えれば」 | 「以上より」 |
| 次に進む | 「では、次に」「続いて」 | 「次いで」（文語）|
| 注意を促す | 「ここがポイントです」「少し注意が必要で」 | 「注意してください」（命令形）|

---

## 5. 数式・記号・専門用語の読み上げ

### 5-1 記号は日本語に書き換える

TTS は記号を誤読・スキップするため、台本段階で日本語に変換する。

| 表記 | 台本での書き方 |
|---|---|
| 2³ | 2 の 3 乗 |
| 50% | 50 パーセント |
| / | スラッシュ／割る／対 |
| × | かける |
| ≦ | 以下 |
| → | 矢印／つまり／〜になる |
| O(n log n) | オーダー n log n |
| ∴ | よって、したがって |
| % | パーセント |
| ¥9,800 | 9,800 円 |

### 5-2 多音字・難読語はカタカナに

| 誤読リスク | 台本表記 |
|---|---|
| 行列（ぎょうれつ／こうれつ）| 「ギョウレツ」 |
| 最適（さいてき／さいよく）| 「サイテキ」 |
| 2 進数（ニしんすう／ふたしんすう）| 「2 進数」または「ニ進数」 |
| RAM | 「ラム」 |
| CPU | 「シーピーユー」 |
| API | 「エーピーアイ」 |
| 1011（バイナリ列）| 「1011（イチ・ゼロ・イチ・イチ）」または各桁を空白で区切る |

### 5-3 専門用語は初出で必ず定義

```
〔初出パターン〕
「[用語] といいます。」
「[用語]、つまり [日本語的な説明] ですが、」

例:
NG: 「API を使ってデータを取得します。」（無定義）
OK: 「API、つまりアプリ間の通信窓口ですが、これを使ってデータを取得します。」
```

- 一度に 3 つ以上の新用語を出さない
- 用語が画面表示されているタイミングで音声でも読み上げる（時間的近接性）

---

## 6. ElevenLabs 特有の最適化

### 6-1 モデル選択

| 用途 | 推奨 |
|---|---|
| 日本語ナレーション | **Multilingual v2**（数字正規化サポート、安定）|
| 高速・コスト優先 | Flash v2.5（日本語安定性は v2 より低）|
| 感情豊かな表現 | **Eleven v3**（音声タグで制御、ただし `<break>` 非対応）|

### 6-2 推奨日本語ボイス

| Voice ID | 名前 | 特徴 | 使いどころ |
|---|---|---|---|
| `RBnMinrYKeccY3vaUxlZ` | Sakura - Narrational | 日本語女性、calm、解説向け | デフォルト |

### 6-3 API パラメータ（multilingual_v2）

```json
{
  "text": "...",
  "model_id": "eleven_multilingual_v2",
  "apply_text_normalization": "on",
  "voice_settings": {
    "stability": 0.55,
    "similarity_boost": 0.75,
    "style": 0.0,
    "use_speaker_boost": true
  }
}
```

- `apply_text_normalization: "on"` → 数字・日付・記号を自動で読みやすく変換（multilingual_v2 のみ）
- `stability` を上げると安定するが抑揚が減る。0.4〜0.6 が解説向け
- `style` は 0 にする（高いと感情過剰）

### 6-4 ポーズと抑揚の作り方

- 読点（、）→ 約 0.2 秒
- 句点（。）→ 約 0.5 秒
- 三点リーダー（…）→ 意図的な間／熟考
- ダッシュ（—）→ 短い区切り
- v2 では `<break time="1.0s" />` で明示的なポーズが打てる
- v3 は `<break>` 非対応 — 句読点と「、、」「……」で間を作る

---

## 7. ターゲット層に合わせた語り口（Que の場合）

20 代女性・キャリアアップ志向。「カフェで一緒に勉強している先輩」のイメージ。

### OK / NG パターン

| OK | NG |
|---|---|
| 「〜を見てみましょう」（提案）| 「〜を覚えてください」（命令）|
| 「ここは少し難しいですが」（共感）| 「簡単です！」（過度な励まし）|
| 「実際の試験ではこう出ます」（具体）| 「必ず出ます！」（断言・煽り）|
| 「7 日続いています」（事実陳述）| 「あと少し！頑張れ！」（煽り）|
| 「自然とつかめてきます」（アスピレーショナル）| 「重要です」（命令的断言）|

### 文体ルール

- **です・ます調**を基本
- 体言止めは 3 文に 1 回以下
- 「〜ですね」「〜でしょうか」で対話感（多用しない、1 ブロックに 1〜2 回まで）
- 一人称（「私」「Que」）は使わない
- 感嘆符は 1 ブロックに最大 1 個
- アスピレーショナル形（提案・呼びかけ）。断言形・煽り・FOMO 禁止

---

## 8. 台本作成ワークフロー

```
1. 画面に出る情報を先に決める（図・テキスト・アニメーション）
2. 各シーンの秒数 × 5 字/秒 で文字数バジェットを出す（300字/分基準）
3. 画面と「役割を分けた」ナレーションを書く
   → 画面 = キーワード・数式・図
   → 音声 = なぜ・文脈・接続
4. 声に出して通読。1 文 10 秒超は分割
5. TTS 向け変換: 数字・記号・難読語をカタカナ・日本語表記に
6. 短いテストで読み上げ確認 → 不自然な間・誤読を修正
7. 動画と同期確認 → 該当の画面要素と音声が同時に出ているか
```

### バジェット表（よく使う）

| シーン秒数 | 目標文字数（5字/秒）| 70% 余裕版 |
|---|---|---|
| 4 秒 | 20 字 | 14 字 |
| 5 秒 | 25 字 | 18 字 |
| 10 秒 | 50 字 | 35 字 |
| 15 秒 | 75 字 | 53 字 |
| 20 秒 | 100 字 | 70 字 |
| 30 秒 | 150 字 | 105 字 |
| 40 秒 | 200 字 | 140 字 |

---

## 9. 教育ナレーション 12 戒（チェックリスト）

PR・台本レビューでこのチェックリストを通すこと。

| # | DO | DON'T |
|---|---|---|
| 1 | 1 分 300 字ペース | 360 字以上詰め込む |
| 2 | 1 文 45 字以内・1 文 1 情報 | 接続詞で繋いで 70 字超の長文 |
| 3 | 画面と音声で **役割を分ける**（音声=なぜ／画面=何）| 画面テキストと完全一致の音声 |
| 4 | 音声と画面要素を **同時** 表示 | 図のあと説明／説明のあと図 |
| 5 | 「名前 → 定義 → 仕組み → 例」の順 | いきなり応用例から |
| 6 | 数字・記号は日本語表記（「2 の 3 乗」「50 パーセント」）| 「2³」「50%」をそのまま |
| 7 | 難読語はカタカナ表記 | テストなしで難読漢字を使う |
| 8 | 動画は 6 分以内 | 10 分超の一本動画 |
| 9 | 提案・共感形（「見てみましょう」）| 命令形・煽り（「頑張れ！」）|
| 10 | 専門用語は初出で「〜つまり〜」と定義 | 初出で略語をそのまま |
| 11 | 接続詞で論理を明示（「すると」「なぜなら」「つまり」）| 接続詞なしで結論だけ並べる |
| 12 | v3 では「、、」「……」で間を作る | v3 で `<break>` タグを使う（非対応）|

---

## 10. ElevenLabs CLI ワンライナー（参考）

```bash
KEY="<api-key>"
VOICE="RBnMinrYKeccY3vaUxlZ"  # Sakura

curl -s -X POST "https://api.elevenlabs.io/v1/text-to-speech/${VOICE}" \
  -H "xi-api-key: ${KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "text":"<台本本文>",
    "model_id":"eleven_multilingual_v2",
    "apply_text_normalization":"on",
    "voice_settings":{"stability":0.55,"similarity_boost":0.75,"style":0.0,"use_speaker_boost":true}
  }' \
  --output scene-NN.mp3
```

---

## 参照ソース

- [ナレロク: ナレーションのスピード](https://nareroku.com/column/goodpacenarration/)
- [NHK 式 7 つのルール（1 分 300 文字）](https://diamond.jp/articles/-/56483?page=3)
- [ElevenLabs Best Practices 公式](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices)
- [PMC: Effective Educational Videos (CBE Life Sci Edu 2016)](https://pmc.ncbi.nlm.nih.gov/articles/PMC5132380/)
- [Mayer's 12 Principles of Multimedia Learning](https://www.digitallearninginstitute.com/blog/mayers-principles-multimedia-learning)
- [Articulate: Redundancy Principle](https://community.articulate.com/blog/articles/redundancy-principle-should-you-duplicate-narrated-text-on-screen/1144276)
- [Stanford Daily: Grant Sanderson on Stories and Visuals](https://stanforddaily.com/2020/01/24/3blue1brown-creator-grant-sanderson-15-talks-engaging-with-math-using-stories-and-visuals/)
- [AWS Blog: Optimizing Japanese TTS with Polly](https://aws.amazon.com/blogs/machine-learning/optimizing-japanese-text-to-speech-with-amazon-polly/)
- [Cognitive Apprenticeship - Collins, Brown, Holum](https://www.aft.org/ae/winter1991/collins_brown_holum)
