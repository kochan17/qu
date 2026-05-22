class QuestionReviewState < ApplicationRecord
  belongs_to :user
  belongs_to :question

  validates :question_id, uniqueness: { scope: :user_id }
  # due_at は DB デフォルト（now()）+ NOT NULL で担保。
  validates :reps,   numericality: { greater_than_or_equal_to: 0 }
  validates :lapses, numericality: { greater_than_or_equal_to: 0 }

  # 期限が来た（復習すべき）状態。
  scope :due, ->(at = Time.current) { where(due_at: ..at) }

  # 正誤を 1 件反映し、FSRS-5 で次回の出題状態を更新する。
  # 自テーブルのみを更新する（cross-model 副作用は持たない）。
  def apply_review!(correct:)
    result = Fsrs.next_state(
      stability:        stability.to_f,
      difficulty:       difficulty.to_f,
      reps:             reps.to_i,
      last_reviewed_at: last_reviewed_at,
      correct:          correct
    )

    update!(
      stability:        result[:stability],
      difficulty:       result[:difficulty],
      due_at:           result[:due_at],
      reps:             reps.to_i + 1,
      lapses:           correct ? lapses.to_i : lapses.to_i + 1,
      last_reviewed_at: Time.current
    )
  end
end
