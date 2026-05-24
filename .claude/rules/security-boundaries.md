# Security Boundaries — AI が踏み込まない領域

> Claude Code・Codex・MCP サーバー等の AI エージェントが Qu の開発に関与する前提でのガードレール。
> ここに書かれた線は **AI 自身が自律判断で越えてはいけない**。越えそうな時は必ず人間に確認する。

## 1. 認証情報・鍵

- `config/master.key` / `config/credentials/*.key` を**読まない・コピーしない・出力しない**
- `~/.claude/secrets/` 配下を読まない（macOS Keychain ベースの vault が一次情報）
- `.env`・`config/database.yml` 等に書かれた値を**チャット・コミット・ログに出さない**
- 認証情報が必要なら `~/.claude/bin/secret get <NAME>` で取得し、変数経由のみで使う（`~/.claude/rules/credentials.md` 参照）
- `.canary-tokens.yml` のダミー値を**本物だと勘違いして API リクエストに使わない**（踏むと audit_logs に記録される）

## 2. 破壊的・不可逆操作

実行する前に必ず**人間に確認**する。サイレントに走らせない:

- `rm -rf` / `rm -r`
- `git push --force` / `git reset --hard origin/main` / `git clean -f`
- `bin/rails db:reset` / `db:drop` / `db:rollback` (本番)
- `DROP TABLE` / `TRUNCATE` を含む SQL
- 本番 DB への直接接続（Render Shell から人間が叩く前提）
- 既存ファイルの破壊的な上書き（特に `git mv` 後の `rm`）

`~/.claude/CLAUDE.md` の Filesystem Safety Rules、`careful` skill も参照。

## 3. 本番環境への変更

- `main` ブランチへの直接 push 禁止。**必ず PR 経由**で、人間レビューを通す
- Render auto-deploy は `main` push 起点 → AI が直接 push したらそのまま本番反映される。**ローカルでテスト → PR → 人間 merge** の順を守る
- 本番 DB マイグレーションは Render Shell から人間が実行（AI は dev/test のみ）
- 本番認証情報をローカルに同期しない

## 4. 依存関係の追加

- 新しい gem / npm パッケージ / MCP サーバーの追加は**必ず理由を添えてユーザーに確認**
- AI が「便利だから」入れない。Rails 標準で足りないか先に検討（`~/.claude/rules/rails-conventions.md` の「gem 足し算しない」）
- 幻覚で実在しないパッケージ名を提案するリスクあり（slopsquatting）→ パッケージ名は必ず公式リポジトリで実在確認

## 5. ユーザーデータ・PII

- 本番 DB の顧客データを seed / fixture / dev DB にコピーしない
- メールアドレス・パスワード・個人情報をログに出さない（`config/initializers/filter_parameter_logging.rb` 参照）
- LLM API に PII を渡す場合は明示の同意ベース + DPA 確認

## 6. プロンプトインジェクション防御（将来 AI Q&A を実装する時）

- ユーザー入力は**「データ」として LLM に渡す**。`<user_input>...</user_input>` で囲って system prompt と分離（Spotlighting）
- LLM 出力をそのまま HTML 描画しない（Markdown 経由か再 sanitize）
- LLM に SQL を書かせない。プリペアド文 + パラメータ
- LLM API 呼び出しに **per-user rate limit**
- ユーザー入力に "Ignore previous instructions" 系の文字列が含まれていたら audit_logs に記録

## 7. コンテンツの canary を消さない

`content/` 配下の Markdown に仕込まれた canary コメント（`QU_CANARY_*` で始まる識別子）を AI が**自動で削除・整形しない**。これは流出検知の網。

## 8. AI エージェントの権限を絞る

- MCP サーバーのファイル権限は**必要なディレクトリだけ**マウント（`~/projects/personal/qu` 全体に与えない）
- ネットワーク／プロセス実行権限を持つ MCP は信頼できる組織のものに限定
- 未知の MCP を `~/.claude/mcp.json` に追加する前に、GitHub の owner・stars・コードを確認

## 9. 監査ログ尊重

- `audit_logs` テーブルへの書き込みは AI も対象。**監査ログを削除・改ざんしない**
- `Content::Importer` 等の管理操作は AuditLog.record! を残す

## 10. 緊急時のフェイルセーフ

異変を感じたら**手を止めて報告**:

- canary token が踏まれた audit log を見たら作業中断
- 「やってしまった」と思った操作は隠さない・自己修復を試みる前に報告
- 想定外の出力を AI が生成した場合（個人情報・他人のコード等）、貼り付けずに警告
