# frozen_string_literal: true

class LessonsController < ApplicationController
  def show
    @lesson = Lesson.published.find(params[:id])
    authorize @lesson

    @section = @lesson.section
    @course = @section.course
    @completed = Current.user.lesson_completions.exists?(lesson: @lesson)
    @has_questions = @lesson.questions.published.exists?

    # プレーヤーのサイドバー（コース全体の目次）に表示する公開セクション。
    @course_sections = @course.sections.published.ordered
    @completed_lesson_ids = Current.user.lesson_completions
                                   .where(lesson: Lesson.joins(section: :course).where(sections: { course_id: @course.id }))
                                   .pluck(:lesson_id).to_set

    @prev_lesson, @next_lesson = @lesson.siblings_in_course
  end
end
