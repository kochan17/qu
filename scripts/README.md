# que-scripts: RAG埋め込みパイプライン

`content/` 配下の Markdown を OpenAI でベクトル化し、Supabase の `public.embeddings` テーブルに upsert するスクリプト。

## セットアップ

```bash
cd scripts
cp .env.example .env
# .env を編集して各キーを設定

pnpm install
```

## 実行

```bash
# 通常実行（差分のみ処理）
pnpm tsx embed-content.ts

# 確認のみ（DB書き込みなし）
pnpm tsx embed-content.ts --dry-run

# コンテンツディレクトリを指定
pnpm tsx embed-content.ts --content-dir ../content
```

## 環境変数

| 変数名 | 説明 |
|---|---|
| `OPENAI_API_KEY` | OpenAI APIキー |
| `SUPABASE_URL` | Supabase URL（ローカル: `http://127.0.0.1:54321`） |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key（RLS bypass） |

## 動作仕様

- `content/` が空なら `"No markdown files found."` で exit 0
- ファイルの SHA-1 ハッシュで差分検知：同一ハッシュは skip、変更時は delete → insert
- 資格別ディレクトリ名から資格スラッグを自動付与
  - `content/{it-passport,ip}/` → `ip`
  - `content/{basic-information-engineer,fe}/` → `fe`
  - `content/{generative-ai-passport,genai}/` → `genai`
  - `content/{g-test,gken}/` → `gken`
  - `content/spi/` → `spi`
  - `content/boki/` → `boki`
- `\n\n` でパラグラフ分割、最大100件ずつ OpenAI にバッチ送信

## デバッグTips

- ローカルSupabaseが起動していない場合は `supabase start`（`que/` ルートから）
- `--dry-run` でファイル一覧とパラグラフ数の確認のみ可能（API呼び出しなし）
- OpenAI API呼び出し数 = `ceil(paragraphs / 100)` per file
