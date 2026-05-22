class LessonCompletion < ApplicationRecord
  belongs_to :user
  belongs_to :lesson

  validates :lesson_id, uniqueness: { scope: :user_id }
  # completed_at は DB デフォルト（now()）+ NOT NULL で担保。
end
