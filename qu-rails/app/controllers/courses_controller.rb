# frozen_string_literal: true

class CoursesController < ApplicationController
  def index
    @certification = Certification.published.find_by(slug: Current.user.preferred_certification)
    @courses = @certification ? policy_scope(Course).where(certification: @certification).ordered : Course.none
    @course_progress = build_course_progress(@courses)
  end

  def show
    @course = Course.published.find(params[:id])
    authorize @course

    @sections = @course.sections.published.ordered.includes(lessons: :lesson_completions)

    # 進捗計算（コース全体）
    all_lesson_ids = @sections.flat_map { |s| s.lessons.published.map(&:id) }
    completed_lesson_ids = Current.user.lesson_completions
      .where(lesson_id: all_lesson_ids).pluck(:lesson_id).to_set

    @total_lessons = all_lesson_ids.size
    @completed_lessons = all_lesson_ids.count { |id| completed_lesson_ids.include?(id) }
    @completed_lesson_ids = completed_lesson_ids
  end

  private

  # 各コースの { total:, completed: } を、コース数によらず 3 クエリで計算する。
  def build_course_progress(courses)
    course_ids = courses.map(&:id)
    return {} if course_ids.empty?

    section_to_course = Section.published.where(course_id: course_ids).pluck(:id, :course_id).to_h
    lesson_to_section = Lesson.published.where(section_id: section_to_course.keys).pluck(:id, :section_id).to_h
    completed_ids     = Current.user.lesson_completions
                               .where(lesson_id: lesson_to_section.keys).pluck(:lesson_id).to_set

    course_ids.index_with do |course_id|
      lesson_ids = lesson_to_section.select { |_lid, sid| section_to_course[sid] == course_id }.keys
      { total: lesson_ids.size, completed: lesson_ids.count { |id| completed_ids.include?(id) } }
    end
  end
end
