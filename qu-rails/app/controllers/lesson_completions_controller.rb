# frozen_string_literal: true

class LessonCompletionsController < ApplicationController
  def create
    lesson = Lesson.published.find(params[:lesson_id])
    authorize lesson, :show?

    completion = Current.user.lesson_completions.find_or_initialize_by(lesson: lesson)
    authorize completion
    completion.save! unless completion.persisted?

    redirect_back fallback_location: lesson_path(lesson)
  end
end
