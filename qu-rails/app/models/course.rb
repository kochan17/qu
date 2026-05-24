class Course < ApplicationRecord
  include Publishable

  belongs_to :certification
  has_many :sections, dependent: :destroy

  validates :title,    presence: true
  validates :position, numericality: { greater_than_or_equal_to: 0 }

  # 複数コースのレッスン進捗を {course_id => {total:, completed:}} で返す。
  # 集約クエリ 2 本で計算し、コース数によらず N+1 にならない。
  def self.progress_summary_for(courses, user)
    lessons = Lesson.published.joins(section: :course)
                    .where(courses: { id: courses }, sections: { is_published: true })
    total = lessons.group("courses.id").count
    done  = lessons.joins(:lesson_completions)
                   .where(lesson_completions: { user_id: user.id })
                   .group("courses.id").count

    courses.map(&:id).index_with { |id| { total: total[id].to_i, completed: done[id].to_i } }
  end
end
