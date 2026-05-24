# frozen_string_literal: true

class CoursesController < ApplicationController
  def index
    @certification = Certification.published.find_by(slug: Current.user.preferred_certification)
    scoped = policy_scope(Course)
    @courses = @certification ? scoped.where(certification: @certification).ordered : scoped.none
    @course_progress = Course.progress_summary_for(@courses, Current.user)
  end

  def show
    @course = Course.published.find(params[:id])
    authorize @course

    @sections = @course.sections.published.ordered
    lessons   = Lesson.published.where(section: @sections).ordered.to_a
    @lessons_by_section   = lessons.group_by(&:section_id)
    @completed_lesson_ids = Current.user.lesson_completions
                                   .where(lesson_id: lessons.map(&:id)).pluck(:lesson_id).to_set
    @total_lessons     = lessons.size
    @completed_lessons = @completed_lesson_ids.size
  end
end
