module ApplicationHelper
  # Material Symbols（唯一許可されたアイコンセット）を描画する。
  # 背景に丸／角丸アクセントは付けない（~/.claude/rules/ui-icon-styling.md）。
  def icon(name, filled: false, css: nil, **options)
    classes = [ "material-symbols-outlined", ("icon-filled" if filled), css, options.delete(:class) ]
    aria = { hidden: true }.merge(options.delete(:aria) || {})
    tag.span(name, class: classes, aria: aria, **options)
  end

  # コントローラ名 → ナビゲーショングループ。アクティブ状態の判定に使う。
  NAV_GROUPS = {
    "dashboard"          => :today,
    "courses"            => :learn,
    "lessons"            => :learn,
    "lesson_completions" => :learn,
    "practice"           => :practice,
    "quiz_results"       => :practice,
    "settings"           => :settings
  }.freeze
  private_constant :NAV_GROUPS

  def current_nav
    NAV_GROUPS[controller_name]
  end

  # グローバルナビゲーション項目（トップナビ / モバイルボトムタブ共通）。
  # [ナビグループ, ラベル, パス, Material Symbols 名]
  def nav_items
    [
      [ :today,    "マイラーニング", root_path,     "school" ],
      [ :learn,    "コースを探す",   courses_path,  "explore" ],
      [ :practice, "演習",          practice_path, "quiz" ],
      [ :settings, "設定",          settings_path, "settings" ]
    ]
  end

  # 標準ヘッダー/フッターを出さないコントローラ。
  # 認証フロー（独自レイアウト）と学習プレーヤー（独自シェル）が該当。
  CHROMELESS_CONTROLLERS = %w[ sessions registrations passwords lessons ].freeze
  private_constant :CHROMELESS_CONTROLLERS

  def app_chrome?
    authenticated? && CHROMELESS_CONTROLLERS.exclude?(controller_name)
  end

  WDAYS = %w[ 日 月 火 水 木 金 土 ].freeze
  private_constant :WDAYS

  def japanese_date(date)
    "#{date.year}年#{date.month}月#{date.day}日（#{WDAYS[date.wday]}）"
  end

  def percent_of(done, total)
    return 0 unless total.positive?

    [ (done.to_f / total * 100).round, 100 ].min
  end

  def queue_summary(queue)
    [
      ("復習 #{queue[:due]} 問" if queue[:due].positive?),
      ("新規 #{queue[:new]} 問" if queue[:new].positive?)
    ].compact.join("・")
  end

  def answer_choice_tone(question, choice, result)
    if question.correct?(choice["id"])
      "border-correct bg-correct-soft"
    elsif choice["id"].to_s == result.selected_choice_id.to_s
      "border-incorrect bg-incorrect-soft"
    else
      "border-outline-variant bg-surface-container-lowest"
    end
  end
end
