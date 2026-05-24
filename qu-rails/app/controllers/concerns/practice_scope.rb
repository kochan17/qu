# 演習の対象レッスンを取得するだけの concern。
# PracticeController と QuizResultsController で共有する。
module PracticeScope
  extend ActiveSupport::Concern

  included do
    helper_method :practice_lesson
  end

  private

  # ?lesson_id= が指定されていればレッスン単位の演習。なければ今日のキュー。
  def practice_lesson
    return @practice_lesson if defined?(@practice_lesson)

    @practice_lesson =
      if params[:lesson_id].present?
        Lesson.published.find(params[:lesson_id])
      end
  end
end
