class Lesson < ApplicationRecord
  belongs_to :section
  has_many :questions,         dependent: :destroy
  has_many :lesson_completions, dependent: :destroy
  has_one_attached :audio

  enum :content_type, {
    video: "video",
    text:  "text",
    audio: "audio",
    quiz:  "quiz"
  }, validate: true

  validates :title,        presence: true
  validates :slug,         presence: true, uniqueness: { scope: :section_id }
  validates :content_type, presence: true
  validates :position,     numericality: { greater_than_or_equal_to: 0 }
  validates :intro,        length: { maximum: 200 }, allow_nil: true
  validates :why_matters,  length: { maximum: 200 }, allow_nil: true

  scope :published, -> { where(is_published: true) }
  scope :ordered,   -> { order(:position) }

  def published?
    is_published?
  end
end
