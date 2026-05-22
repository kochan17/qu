module ApplicationHelper
  # Material Symbols（唯一許可されたアイコンセット）を描画する。
  # 背景に丸／角丸アクセントは付けない（~/.claude/rules/ui-icon-styling.md）。
  def icon(name, filled: false, css: nil)
    tag.span(name,
      class: [ "material-symbols-rounded", ("icon-filled" if filled), css ],
      aria: { hidden: true })
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

  # 認証フロー・オンボーディング中はアプリのグローバルナビを出さない。
  CHROMELESS_CONTROLLERS = %w[ sessions registrations passwords onboarding ].freeze
  private_constant :CHROMELESS_CONTROLLERS

  def app_chrome?
    authenticated? && CHROMELESS_CONTROLLERS.exclude?(controller_name)
  end

  # 資格 slug → 表示名。
  CERTIFICATION_NAMES = {
    "ip"    => "ITパスポート",
    "fe"    => "基本情報技術者",
    "genai" => "生成AIパスポート",
    "gken"  => "G検定"
  }.freeze

  def certification_name(slug)
    CERTIFICATION_NAMES[slug.to_s]
  end

  WDAYS = %w[ 日 月 火 水 木 金 土 ].freeze
  private_constant :WDAYS

  def japanese_date(date)
    "#{date.year}年#{date.month}月#{date.day}日（#{WDAYS[date.wday]}）"
  end
end
