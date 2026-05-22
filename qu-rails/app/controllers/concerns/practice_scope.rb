# 演習の対象範囲（今日のキュー / レッスン単位）と進捗を扱う。
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
        Lesson.published.find_by(id: params[:lesson_id])
      end
  end

  # 今日の DailyActivity（無ければ作成）。リクエスト内でメモ化する。
  def today_activity
    @today_activity ||= Current.user.daily_activities.find_or_create_by!(date: Date.current)
  end

  # 進捗 { done:, total:, caption: }。レッスン単位は習得済み問題数、
  # 今日のキューは Daily Ring（正答数）の進捗。
  def practice_progress
    if practice_lesson
      question_ids = practice_lesson.questions.published.ids
      done = Current.user.quiz_results
                    .where(question_id: question_ids, is_correct: true)
                    .distinct.count(:question_id)
      { done: done, total: question_ids.size, caption: practice_lesson.title }
    else
      { done: today_activity.core_done, total: today_activity.core_goal, caption: "今日の目標" }
    end
  end
end
