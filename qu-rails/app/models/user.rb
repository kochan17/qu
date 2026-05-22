class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

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
  # Daily Ring の 15% プリ充填（Endowed Progress）は onboarding フローの
  # コントローラ／サービスで行う。別モデルを生成する model callback は
  # Rails らしくないため置かない。
end
