class User < ApplicationRecord
  has_secure_password
  has_many :sessions, dependent: :destroy

  normalizes :email_address, with: ->(e) { e.strip.downcase }

  enum :role, { user: "user", admin: "admin" }, validate: true

  has_many :subscriptions,          dependent: :destroy
  has_many :quiz_results,           dependent: :destroy
  has_many :lesson_completions,     dependent: :destroy
  has_many :question_review_states, dependent: :destroy
  has_many :daily_activities,       dependent: :destroy
  has_many :section_masteries,      dependent: :destroy
  has_many :notifications,          dependent: :destroy

  validates :current_streak,      numericality: { greater_than_or_equal_to: 0 }
  validates :longest_streak,      numericality: { greater_than_or_equal_to: 0 }
  validates :streak_freeze_count, numericality: { greater_than_or_equal_to: 0 }

  # `admin?` / `user?` は enum :role が自動生成する。

  def onboarded?
    preferred_certification.present?
  end

  # ストリークを更新する。Mastery-anchored — その日の Daily Ring（正答数）が
  # 閉じた日だけを連続日数として数える。煽らず、終了時にだけ称える設計のため
  # 数値は実態と一致させる。自テーブルのみを更新する。
  def refresh_streak!(on_date: Date.current)
    activity = daily_activities.find_by(date: on_date)
    return unless activity&.core_completed?
    return if last_active_date == on_date # 当日分は計上済み

    self.current_streak =
      (last_active_date == on_date - 1) ? current_streak + 1 : 1
    self.last_active_date = on_date
    self.longest_streak   = [ longest_streak, current_streak ].max
    save!
  end

  # 試験前などに演出（リング・通知・バッジ）を全て止めるモード。
  def calm_mode_active?
    calm_mode? || (calm_mode_until.present? && calm_mode_until >= Date.current)
  end
end
