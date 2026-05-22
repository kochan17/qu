class QuizResult < ApplicationRecord
  belongs_to :user
  belongs_to :question

  validates :is_correct, inclusion: { in: [ true, false ] }
  # answered_at は DB デフォルト（now()）+ NOT NULL で担保。INSERT 前検証で誤判定するため
  # presence バリデーションは付けない（created_at と同じ扱い）。
end
