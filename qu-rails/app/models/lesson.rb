class Lesson < ApplicationRecord
  include Publishable

  belongs_to :section
  has_many :questions,          dependent: :destroy
  has_many :lesson_completions, dependent: :destroy
  has_one_attached  :video
  has_many_attached :images

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

  # アップロード防御。Active Storage 添付の MIME とサイズをサーバ側で検証する。
  validates :video,
            content_type: %w[ video/mp4 video/quicktime video/webm ],
            size: { less_than: 500.megabytes }
  validates :images,
            content_type: %w[ image/png image/jpeg image/webp image/svg+xml image/gif ],
            size: { less_than: 10.megabytes }

  # このレッスンの演習進捗 { done:（正答済み問題数）, total:（公開問題数）}。
  def user_progress(user)
    question_ids = questions.published.ids
    done = user.quiz_results.where(question_id: question_ids, is_correct: true)
               .distinct.count(:question_id)
    { done: done, total: question_ids.size }
  end

  # コース内で position 順に並んだ前後のレッスンを返す。
  # 戻り値: [prev_lesson_or_nil, next_lesson_or_nil]
  def siblings_in_course
    ordered_lessons = Lesson.published
                            .joins(:section)
                            .where(sections: { course_id: section.course_id, is_published: true })
                            .order("sections.position, lessons.position")
    ids = ordered_lessons.pluck(:id)
    idx = ids.index(id)
    return [nil, nil] unless idx

    prev_lesson = idx.positive? ? ordered_lessons.find(ids[idx - 1]) : nil
    next_lesson = idx < ids.length - 1 ? ordered_lessons.find(ids[idx + 1]) : nil
    [prev_lesson, next_lesson]
  end
end
