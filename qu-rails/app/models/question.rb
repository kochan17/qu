class Question < ApplicationRecord
  belongs_to :lesson
  has_many :quiz_results,           dependent: :destroy
  has_many :question_review_states, dependent: :destroy

  enum :format, {
    multiple_choice: "multiple_choice",
    written:         "written",
    cbt:             "cbt"
  }, validate: true

  enum :status, {
    draft:     "draft",
    published: "published"
  }, validate: true

  validates :format,        presence: true
  validates :question_text, presence: true
  validates :status,        presence: true
  validates :position,      numericality: { greater_than_or_equal_to: 0 }

  # `published` スコープと `published?` は enum :status が自動生成する。
  scope :ordered, -> { order(:position) }
end
