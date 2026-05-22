class DailyActivity < ApplicationRecord
  belongs_to :user

  validates :date,         presence: true
  validates :date,         uniqueness: { scope: :user_id }
  validates :recall_count, numericality: { greater_than_or_equal_to: 0 }
  validates :learn_count,  numericality: { greater_than_or_equal_to: 0 }
  validates :audio_count,  numericality: { greater_than_or_equal_to: 0 }
  validates :recall_goal,  numericality: { greater_than: 0 }
  validates :learn_goal,   numericality: { greater_than: 0 }
  validates :audio_goal,   numericality: { greater_than: 0 }

  def increment_audio_count!
    increment!(:audio_count)
  end

  # 正答を 1 件記録する。Daily Ring は正答数で進む（Mastery-anchored）。
  # kind: :recall（復習問題）/ :learn（新規問題）
  def record_correct!(kind)
    case kind.to_sym
    when :recall then increment!(:recall_count)
    when :learn  then increment!(:learn_count)
    else raise ArgumentError, "unknown kind: #{kind}"
    end
  end

  # Phase 1 は Audio 機能が無いため、Daily Ring の達成は復習 + 新規のみで判定する
  # （DB 生成列 completed は audio_goal を含むため Phase 1 では使わない）。
  def core_done = recall_count + learn_count
  def core_goal = recall_goal + learn_goal
  def core_completed? = core_done >= core_goal

  def core_percent
    return 0 if core_goal.zero?
    [ (core_done.to_f / core_goal * 100).round, 100 ].min
  end
end
