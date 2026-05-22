# frozen_string_literal: true

class LessonCompletionsController < ApplicationController
  def create
    # 公開レッスンに対する自分の完了記録。Lesson.published で未公開を弾き、
    # Current.user スコープで自分のレコードに限定される（冪等）。
    lesson = Lesson.published.find(params[:lesson_id])
    Current.user.lesson_completions.find_or_create_by!(lesson: lesson)
    redirect_back fallback_location: lesson_path(lesson), notice: "レッスンを完了しました。"
  end
end
