# frozen_string_literal: true

class LessonsController < ApplicationController
  def show
    @lesson = Lesson.published.find(params[:id])
    authorize @lesson

    @section = @lesson.section
    @course = @section.course
    @completed = Current.user.lesson_completions.exists?(lesson: @lesson)
    @has_questions = @lesson.questions.published.exists?
  end
end
