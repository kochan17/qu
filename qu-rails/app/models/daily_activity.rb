class DailyActivity < ApplicationRecord
  belongs_to :user

  validates :date,         presence: true
  validates :date,         uniqueness: { scope: :user_id }
  validates :recall_count, numericality: { greater_than_or_equal_to: 0 }
  validates :learn_count,  numericality: { greater_than_or_equal_to: 0 }
  validates :recall_goal,  numericality: { greater_than: 0 }
  validates :learn_goal,   numericality: { greater_than: 0 }

  # 正答を 1 件記録する。Daily Ring は正答数で進む（Mastery-anchored）。
  # kind: :recall（復習問題）/ :learn（新規問題）
  def record_correct!(kind)
    case kind.to_sym
    when :recall then increment!(:recall_count)
    when :learn  then increment!(:learn_count)
    else raise ArgumentError, "unknown kind: #{kind}"
    end
  end

  def core_done = recall_count + learn_count
  def core_goal = recall_goal + learn_goal
  def core_completed? = core_done >= core_goal

  def core_percent
    percent(core_done, core_goal)
  end

  def recall_percent = percent(recall_count, recall_goal)
  def learn_percent = percent(learn_count, learn_goal)

  private

  def percent(done, goal)
    return 0 unless goal.positive?

    [ (done.to_f / goal * 100).round, 100 ].min
  end
end
