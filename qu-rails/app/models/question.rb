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

  # 指定資格に属する公開問題（公開コースの公開セクションの公開レッスン配下）。
  scope :for_certification, ->(certification) {
    published
      .joins(lesson: { section: :course })
      .where(courses: { certification_id: certification.id, is_published: true })
      .where(sections: { is_published: true })
      .where(lessons:  { is_published: true })
  }

  # コンテンツ階層順（コース → セクション → レッスン → 問題）の並び。
  scope :in_content_order, -> {
    joins(lesson: { section: :course })
      .order("courses.position", "sections.position", "lessons.position", "questions.position")
  }

  # 選択肢配列 [{ "id" =>, "text" => }] から id に対応するテキストを返す。
  def choice_text(choice_id)
    Array(choices).find { |c| c["id"].to_s == choice_id.to_s }&.dig("text")
  end

  def correct?(choice_id)
    correct_choice_id.present? && choice_id.to_s == correct_choice_id.to_s
  end
end
