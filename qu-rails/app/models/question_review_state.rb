class QuestionReviewState < ApplicationRecord
  belongs_to :user
  belongs_to :question

  validates :question_id, uniqueness: { scope: :user_id }
  # due_at は DB デフォルト（now()）+ NOT NULL で担保。
  validates :reps,   numericality: { greater_than_or_equal_to: 0 }
  validates :lapses, numericality: { greater_than_or_equal_to: 0 }
end
