# frozen_string_literal: true

# db/seeds.rb
# 冪等 (find_or_create_by!) — bin/rails db:seed を何度実行しても安全

# ── ユーザー ──────────────────────────────────────────────
admin = User.find_or_create_by!(email_address: "admin@que.test") do |u|
  u.password              = "password"
  u.password_confirmation = "password"
  u.display_name          = "管理者"
  u.role                  = "admin"
  u.preferred_certification = "ip"
end
puts "User: #{admin.email_address} (#{admin.role})"

learner = User.find_or_create_by!(email_address: "user@que.test") do |u|
  u.password              = "password"
  u.password_confirmation = "password"
  u.display_name          = "学習者"
  u.role                  = "user"
  u.preferred_certification = "ip"
end
puts "User: #{learner.email_address} (#{learner.role})"

# ── ITパスポート 認定 ──────────────────────────────────────
ip = Certification.find_or_create_by!(slug: "ip") do |c|
  c.name         = "ITパスポート"
  c.description  = "ITを利用する上で必要な基礎的な知識を習得する国家試験"
  c.category     = "it"
  c.is_published = true
  c.position     = 0
end
puts "Certification: #{ip.name}"

# ── 残り 3 資格（Phase 1 はコンテンツ未投入の枠のみ）──────────
[
  { slug: "fe",    name: "基本情報技術者",     position: 1,
    description: "ITエンジニアの登竜門。アルゴリズムと基礎理論を問う国家試験" },
  { slug: "genai", name: "生成AIパスポート",   position: 2,
    description: "生成AIを安全に活用するためのリテラシーを測る検定" },
  { slug: "gken",  name: "G検定",             position: 3,
    description: "ディープラーニングの基礎知識と活用方針を問う検定" }
].each do |attrs|
  cert = Certification.find_or_create_by!(slug: attrs[:slug]) do |c|
    c.name         = attrs[:name]
    c.description  = attrs[:description]
    c.category     = "it"
    c.is_published = true
    c.position     = attrs[:position]
  end
  puts "Certification: #{cert.name}"
end

# ── コース 1: ストラテジ系 ──────────────────────────────────
course1 = Course.find_or_create_by!(title: "ストラテジ系", certification: ip) do |c|
  c.description  = "経営戦略・情報戦略・システム戦略を学ぶ"
  c.is_published = true
  c.position     = 0
end
puts "  Course: #{course1.title}"

# コース1 > セクション1: 経営戦略
sec1_1 = Section.find_or_create_by!(title: "経営戦略", course: course1) do |s|
  s.is_published = true
  s.position     = 0
end

# コース1 > セクション1 > レッスン
lesson1 = Lesson.find_or_create_by!(slug: "bsc", section: sec1_1) do |l|
  l.title        = "バランスト・スコアカード"
  l.content_type = "text"
  l.is_published = true
  l.position     = 0
  l.body         = <<~MD
    ## バランスト・スコアカード（BSC）とは

    経営戦略を**財務・顧客・業務プロセス・学習と成長**の4視点から評価するフレームワーク。

    - **財務の視点**: 売上高・利益率など数値で見る
    - **顧客の視点**: 顧客満足度・市場シェア
    - **業務プロセスの視点**: 業務効率・品質
    - **学習と成長の視点**: 人材育成・組織能力

    KPI を4視点に分散させることで、短期利益偏重を防ぎバランスよく戦略を実行できる。
  MD
  l.intro        = "財務以外の視点でも経営を測る4視点フレームワーク"
  l.why_matters  = "IPA 試験で毎回出題される頻出テーマ"
end

lesson2 = Lesson.find_or_create_by!(slug: "swot", section: sec1_1) do |l|
  l.title        = "SWOT分析"
  l.content_type = "text"
  l.is_published = true
  l.position     = 1
  l.body         = <<~MD
    ## SWOT分析

    自社の状況を**内部環境と外部環境**に分けて分析するフレームワーク。

    | | プラス | マイナス |
    |---|---|---|
    | 内部環境 | Strength（強み） | Weakness（弱み） |
    | 外部環境 | Opportunity（機会） | Threat（脅威） |

    4要素を組み合わせた **クロスSWOT** で具体的な戦略を導き出す。
  MD
  l.intro       = "内部・外部環境を4象限で整理する基本フレームワーク"
  l.why_matters = "ケース問題で必ず登場する分析手法"
end

lesson3 = Lesson.find_or_create_by!(slug: "ppma", section: sec1_1) do |l|
  l.title        = "PPM（プロダクト・ポートフォリオ・マトリックス）"
  l.content_type = "text"
  l.is_published = true
  l.position     = 2
  l.body         = <<~MD
    ## PPM（プロダクト・ポートフォリオ・マトリックス）

    ボストン コンサルティング グループが開発した、事業ポートフォリオを管理するフレームワーク。

    **2軸**: 市場成長率（縦）× 相対的市場シェア（横）

    | | 高シェア | 低シェア |
    |---|---|---|
    | 高成長 | 花形（Star） | 問題児（Problem Child） |
    | 低成長 | 金のなる木（Cash Cow） | 負け犬（Dog） |

    - **金のなる木**から資金を調達し、**花形**や**問題児**に投資する。
  MD
  l.intro       = "市場成長率×シェアで4タイプに分類する事業評価手法"
  l.why_matters = "PPM の各象限の名称と特徴は頻出"
end

puts "    Section: #{sec1_1.title} (#{[ lesson1, lesson2, lesson3 ].size} lessons)"

# コース1 > セクション2: 情報システム戦略
sec1_2 = Section.find_or_create_by!(title: "情報システム戦略", course: course1) do |s|
  s.is_published = true
  s.position     = 1
end

lesson4 = Lesson.find_or_create_by!(slug: "ea", section: sec1_2) do |l|
  l.title        = "エンタープライズアーキテクチャ（EA）"
  l.content_type = "text"
  l.is_published = true
  l.position     = 0
  l.body         = <<~MD
    ## エンタープライズアーキテクチャ（EA）

    組織全体の情報システムを**4つのアーキテクチャ**で整理する手法。

    | アーキテクチャ | 内容 |
    |---|---|
    | ビジネスアーキテクチャ | 業務・組織の構造 |
    | データアーキテクチャ | データの構造・流れ |
    | アプリケーションアーキテクチャ | システムの機能構成 |
    | テクノロジアーキテクチャ | ハード・ソフト・ネットワーク構成 |

    日本では TOGAF や Zachman フレームワークが代表的。
  MD
  l.intro       = "情報システム全体を4層で体系化するアーキテクチャ手法"
  l.why_matters = "IT ガバナンス問題の背景知識として必須"
end

lesson5 = Lesson.find_or_create_by!(slug: "bpr", section: sec1_2) do |l|
  l.title        = "BPR（ビジネスプロセス・リエンジニアリング）"
  l.content_type = "text"
  l.is_published = true
  l.position     = 1
  l.body         = <<~MD
    ## BPR（ビジネスプロセス・リエンジニアリング）

    業務プロセスを**根本から抜本的に再設計**して、大幅なパフォーマンス向上を目指す手法。

    マイケル・ハマーが 1990 年代に提唱。

    **ポイント**:
    - 現状の改善ではなく「白紙から設計し直す」
    - IT 活用を前提に業務フローを再構築
    - 組織・役割・評価指標まで変える

    > BPI（ビジネスプロセス・インプルーブメント）との違い: BPI は現状の部分改善、BPR は全面再設計。
  MD
  l.intro       = "業務プロセスを白紙から再設計して劇的改善を狙う手法"
  l.why_matters = "BPI との違いが選択問題でよく問われる"
end

puts "    Section: #{sec1_2.title} (#{[ lesson4, lesson5 ].size} lessons)"

# ── コース 2: テクノロジ系 ──────────────────────────────────
course2 = Course.find_or_create_by!(title: "テクノロジ系", certification: ip) do |c|
  c.description  = "コンピュータ・ネットワーク・セキュリティの基礎"
  c.is_published = true
  c.position     = 1
end
puts "  Course: #{course2.title}"

# コース2 > セクション1: コンピュータの基礎
sec2_1 = Section.find_or_create_by!(title: "コンピュータの基礎", course: course2) do |s|
  s.is_published = true
  s.position     = 0
end

lesson6 = Lesson.find_or_create_by!(slug: "binary", section: sec2_1) do |l|
  l.title        = "2進数と16進数"
  l.content_type = "text"
  l.is_published = true
  l.position     = 0
  l.body         = <<~MD
    ## 2進数と16進数

    コンピュータは内部で**2進数（0と1）**を使って情報を扱う。

    ### 変換早見表

    | 10進数 | 2進数 | 16進数 |
    |---|---|---|
    | 0 | 0000 | 0 |
    | 8 | 1000 | 8 |
    | 10 | 1010 | A |
    | 15 | 1111 | F |
    | 16 | 10000 | 10 |

    ### ビットとバイト
    - 1 ビット = 0 か 1 の 1 桁
    - 1 バイト = 8 ビット → 0〜255（256 通り）の値を表現
  MD
  l.intro       = "コンピュータが使う2進数・16進数の基本"
  l.why_matters = "計算問題として毎回出題される基礎中の基礎"
end

lesson7 = Lesson.find_or_create_by!(slug: "cpu-memory", section: sec2_1) do |l|
  l.title        = "CPU とメモリの基本構造"
  l.content_type = "text"
  l.is_published = true
  l.position     = 1
  l.body         = <<~MD
    ## CPU とメモリの基本構造

    ### CPU（中央処理装置）
    プログラムを**実行する**部品。主に以下で構成される:
    - **演算装置（ALU）**: 四則演算・論理演算
    - **制御装置**: 命令を解釈・実行の指示
    - **レジスタ**: 高速な一時記憶領域

    ### メモリの階層
    | 種類 | 速さ | 容量 | 揮発性 |
    |---|---|---|---|
    | レジスタ | 最速 | 極小 | 揮発 |
    | キャッシュメモリ | 高速 | 小 | 揮発 |
    | 主記憶（RAM） | 普通 | 中 | 揮発 |
    | 補助記憶（SSD等） | 低速 | 大 | 不揮発 |
  MD
  l.intro       = "CPU の構成とメモリ階層の速さ・容量のトレードオフ"
  l.why_matters = "ハードウェア問題の出発点"
end

puts "    Section: #{sec2_1.title} (#{[ lesson6, lesson7 ].size} lessons)"

# コース2 > セクション2: ネットワーク基礎
sec2_2 = Section.find_or_create_by!(title: "ネットワーク基礎", course: course2) do |s|
  s.is_published = true
  s.position     = 1
end

lesson8 = Lesson.find_or_create_by!(slug: "osi-model", section: sec2_2) do |l|
  l.title        = "OSI参照モデル"
  l.content_type = "text"
  l.is_published = true
  l.position     = 0
  l.body         = <<~MD
    ## OSI参照モデル（7層モデル）

    ネットワーク通信を**7つの層（レイヤ）**に分けて標準化したモデル。

    | 層 | 名称 | 役割 | 代表プロトコル |
    |---|---|---|---|
    | 7 | アプリケーション層 | アプリの通信 | HTTP, SMTP, FTP |
    | 6 | プレゼンテーション層 | データ変換・暗号化 | SSL/TLS |
    | 5 | セッション層 | 通信の確立・管理 | — |
    | 4 | トランスポート層 | 信頼性・ポート管理 | TCP, UDP |
    | 3 | ネットワーク層 | 経路制御（ルーティング） | IP |
    | 2 | データリンク層 | 同一ネットワーク内転送 | Ethernet |
    | 1 | 物理層 | 物理的な信号伝送 | 電気信号・光信号 |
  MD
  l.intro       = "ネットワーク通信を7層に分けた国際標準モデル"
  l.why_matters = "各層の役割とプロトコルの対応は必須暗記事項"
end

lesson9 = Lesson.find_or_create_by!(slug: "tcp-ip", section: sec2_2) do |l|
  l.title        = "TCP/IP の基礎"
  l.content_type = "text"
  l.is_published = true
  l.position     = 1
  l.body         = <<~MD
    ## TCP/IP の基礎

    インターネットで使われるプロトコル体系。OSI モデルを実用的に簡略化した**4層モデル**。

    | 層 | 内容 |
    |---|---|
    | アプリケーション層 | HTTP / DNS / SMTP |
    | トランスポート層 | TCP（信頼性）/ UDP（高速） |
    | インターネット層 | IP アドレスによる経路制御 |
    | ネットワークアクセス層 | MAC アドレス・物理伝送 |

    ### TCP vs UDP
    - **TCP**: 届いたか確認（3ウェイハンドシェイク）→ Web・メール
    - **UDP**: 確認しない（速い）→ 動画ストリーミング・DNS
  MD
  l.intro       = "インターネットの基盤プロトコル TCP と UDP の違い"
  l.why_matters = "TCP と UDP の使い分けは必ず出題される"
end

puts "    Section: #{sec2_2.title} (#{[ lesson8, lesson9 ].size} lessons)"

# ── 問題の作成ヘルパー ──────────────────────────────────────
def seed_question(lesson:, position:, question_text:, choices:, correct_choice_id:, explanation:)
  Question.find_or_create_by!(lesson: lesson, position: position) do |q|
    q.format            = "multiple_choice"
    q.question_text     = question_text
    q.choices           = choices
    q.correct_choice_id = correct_choice_id
    q.explanation       = explanation
    q.status            = "published"
  end
end

# ── BSC の問題 ──────────────────────────────────────────────
seed_question(
  lesson: lesson1,
  position: 0,
  question_text: "バランスト・スコアカード（BSC）の4つの視点に含まれないものはどれか。",
  choices: [
    { "id" => "a", "text" => "財務の視点" },
    { "id" => "b", "text" => "顧客の視点" },
    { "id" => "c", "text" => "競合の視点" },
    { "id" => "d", "text" => "学習と成長の視点" }
  ],
  correct_choice_id: "c",
  explanation: "BSC の4視点は「財務」「顧客」「業務プロセス」「学習と成長」。競合の視点は含まれない。"
)

seed_question(
  lesson: lesson1,
  position: 1,
  question_text: "BSC において、従業員のスキルアップや組織能力の向上を評価する視点はどれか。",
  choices: [
    { "id" => "a", "text" => "財務の視点" },
    { "id" => "b", "text" => "顧客の視点" },
    { "id" => "c", "text" => "業務プロセスの視点" },
    { "id" => "d", "text" => "学習と成長の視点" }
  ],
  correct_choice_id: "d",
  explanation: "人材育成・組織能力・知識共有は「学習と成長の視点」に分類される。"
)

# ── SWOT の問題 ─────────────────────────────────────────────
seed_question(
  lesson: lesson2,
  position: 0,
  question_text: "SWOT分析の外部環境のプラス要因を表す言葉はどれか。",
  choices: [
    { "id" => "a", "text" => "Strength（強み）" },
    { "id" => "b", "text" => "Weakness（弱み）" },
    { "id" => "c", "text" => "Opportunity（機会）" },
    { "id" => "d", "text" => "Threat（脅威）" }
  ],
  correct_choice_id: "c",
  explanation: "外部環境のプラス要因は Opportunity（機会）。Strength は内部のプラス要因。"
)

seed_question(
  lesson: lesson2,
  position: 1,
  question_text: "クロスSWOT分析において、強みを活かして機会を最大化する戦略を何というか。",
  choices: [
    { "id" => "a", "text" => "SO戦略（積極的攻勢）" },
    { "id" => "b", "text" => "ST戦略（差別化）" },
    { "id" => "c", "text" => "WO戦略（段階的）" },
    { "id" => "d", "text" => "WT戦略（防衛）" }
  ],
  correct_choice_id: "a",
  explanation: "Strength × Opportunity の組み合わせは SO 戦略（積極的攻勢）。自社の強みを外部機会に活かす。"
)

# ── PPM の問題 ──────────────────────────────────────────────
seed_question(
  lesson: lesson3,
  position: 0,
  question_text: "PPM（プロダクト・ポートフォリオ・マトリックス）において、市場成長率が高く相対的市場シェアも高い事業を何というか。",
  choices: [
    { "id" => "a", "text" => "花形（Star）" },
    { "id" => "b", "text" => "金のなる木（Cash Cow）" },
    { "id" => "c", "text" => "問題児（Problem Child）" },
    { "id" => "d", "text" => "負け犬（Dog）" }
  ],
  correct_choice_id: "a",
  explanation: "高成長率×高シェアは「花形（Star）」。将来の金のなる木候補で、追加投資が必要な段階。"
)

# ── EA の問題 ───────────────────────────────────────────────
seed_question(
  lesson: lesson4,
  position: 0,
  question_text: "エンタープライズアーキテクチャ（EA）の4つの構成要素に含まれないものはどれか。",
  choices: [
    { "id" => "a", "text" => "ビジネスアーキテクチャ" },
    { "id" => "b", "text" => "データアーキテクチャ" },
    { "id" => "c", "text" => "セキュリティアーキテクチャ" },
    { "id" => "d", "text" => "テクノロジアーキテクチャ" }
  ],
  correct_choice_id: "c",
  explanation: "EA の4要素はビジネス・データ・アプリケーション・テクノロジ。セキュリティアーキテクチャは含まれない。"
)

# ── BPR の問題 ──────────────────────────────────────────────
seed_question(
  lesson: lesson5,
  position: 0,
  question_text: "BPR（ビジネスプロセス・リエンジニアリング）の説明として最も適切なものはどれか。",
  choices: [
    { "id" => "a", "text" => "現状の業務プロセスを少しずつ改善していく手法" },
    { "id" => "b", "text" => "業務プロセスを根本から抜本的に再設計する手法" },
    { "id" => "c", "text" => "品質管理を継続的に向上させる PDCA サイクル" },
    { "id" => "d", "text" => "顧客満足度を向上させるための CRM 手法" }
  ],
  correct_choice_id: "b",
  explanation: "BPR は根本的な再設計（白紙から設計し直す）が特徴。現状の部分改善は BPI（ビジネスプロセス・インプルーブメント）。"
)

# ── 2進数の問題 ─────────────────────────────────────────────
seed_question(
  lesson: lesson6,
  position: 0,
  question_text: "2進数の「1010」を10進数に変換した値はどれか。",
  choices: [
    { "id" => "a", "text" => "8" },
    { "id" => "b", "text" => "10" },
    { "id" => "c", "text" => "12" },
    { "id" => "d", "text" => "14" }
  ],
  correct_choice_id: "b",
  explanation: "1×2³ + 0×2² + 1×2¹ + 0×2⁰ = 8 + 0 + 2 + 0 = 10。"
)

seed_question(
  lesson: lesson6,
  position: 1,
  question_text: "1バイトで表現できる最大の10進数値はどれか。",
  choices: [
    { "id" => "a", "text" => "127" },
    { "id" => "b", "text" => "255" },
    { "id" => "c", "text" => "256" },
    { "id" => "d", "text" => "512" }
  ],
  correct_choice_id: "b",
  explanation: "1バイト = 8ビット。2⁸ = 256 通りの値（0〜255）を表現できる。最大値は 255。"
)

# ── CPU の問題 ──────────────────────────────────────────────
seed_question(
  lesson: lesson7,
  position: 0,
  question_text: "CPU の演算装置（ALU）が行う処理はどれか。",
  choices: [
    { "id" => "a", "text" => "プログラムの命令を解釈して実行を指示する" },
    { "id" => "b", "text" => "四則演算や論理演算を行う" },
    { "id" => "c", "text" => "データを長期間保存する" },
    { "id" => "d", "text" => "外部機器との入出力を制御する" }
  ],
  correct_choice_id: "b",
  explanation: "ALU（Arithmetic Logic Unit）は四則演算・論理演算を担当。命令の解釈は制御装置の役割。"
)

seed_question(
  lesson: lesson7,
  position: 1,
  question_text: "コンピュータのメモリ階層において、最も読み書き速度が速い記憶装置はどれか。",
  choices: [
    { "id" => "a", "text" => "主記憶（RAM）" },
    { "id" => "b", "text" => "キャッシュメモリ" },
    { "id" => "c", "text" => "レジスタ" },
    { "id" => "d", "text" => "SSD" }
  ],
  correct_choice_id: "c",
  explanation: "速さの順: レジスタ > キャッシュ > 主記憶（RAM）> 補助記憶（SSD等）。レジスタが最速。"
)

# ── OSI の問題 ──────────────────────────────────────────────
seed_question(
  lesson: lesson8,
  position: 0,
  question_text: "OSI参照モデルの第3層（ネットワーク層）の役割はどれか。",
  choices: [
    { "id" => "a", "text" => "物理的な電気信号の伝送" },
    { "id" => "b", "text" => "同一ネットワーク内でのフレーム転送" },
    { "id" => "c", "text" => "IPアドレスを使った経路制御（ルーティング）" },
    { "id" => "d", "text" => "アプリケーションのデータ通信" }
  ],
  correct_choice_id: "c",
  explanation: "第3層（ネットワーク層）は IP アドレスによる経路制御（ルーティング）を担う。代表プロトコルは IP。"
)

seed_question(
  lesson: lesson8,
  position: 1,
  question_text: "HTTP プロトコルは OSI 参照モデルの何層に属するか。",
  choices: [
    { "id" => "a", "text" => "第4層（トランスポート層）" },
    { "id" => "b", "text" => "第5層（セッション層）" },
    { "id" => "c", "text" => "第6層（プレゼンテーション層）" },
    { "id" => "d", "text" => "第7層（アプリケーション層）" }
  ],
  correct_choice_id: "d",
  explanation: "HTTP は第7層（アプリケーション層）のプロトコル。他に SMTP・FTP・DNS なども同層。"
)

# ── TCP/IP の問題 ───────────────────────────────────────────
seed_question(
  lesson: lesson9,
  position: 0,
  question_text: "UDP に関する説明として正しいものはどれか。",
  choices: [
    { "id" => "a", "text" => "3ウェイハンドシェイクで接続を確立する" },
    { "id" => "b", "text" => "データの到達を保証する信頼性の高いプロトコル" },
    { "id" => "c", "text" => "確認なしで送信するため高速だが信頼性は低い" },
    { "id" => "d", "text" => "Web ブラウザと Web サーバの通信に主に使われる" }
  ],
  correct_choice_id: "c",
  explanation: "UDP はデータ到達の確認を行わない。そのため高速だが信頼性は低い。動画ストリーミングや DNS で使用される。"
)

seed_question(
  lesson: lesson9,
  position: 1,
  question_text: "TCP の3ウェイハンドシェイクの順序として正しいものはどれか。",
  choices: [
    { "id" => "a", "text" => "SYN → SYN-ACK → ACK" },
    { "id" => "b", "text" => "ACK → SYN → SYN-ACK" },
    { "id" => "c", "text" => "SYN → ACK → SYN-ACK" },
    { "id" => "d", "text" => "SYN-ACK → SYN → ACK" }
  ],
  correct_choice_id: "a",
  explanation: "TCP の接続確立: ① クライアントが SYN 送信 → ② サーバが SYN-ACK 返送 → ③ クライアントが ACK 送信。"
)

puts "\nSeed 完了:"
puts "  認定: #{Certification.count}"
puts "  コース: #{Course.count}"
puts "  セクション: #{Section.count}"
puts "  レッスン: #{Lesson.count}"
puts "  問題: #{Question.count}"
puts "  ユーザー: #{User.count}"
