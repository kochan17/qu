# frozen_string_literal: true

# 演習画面。次の 1 問の選定は PracticeQueue に委譲する。
class PracticeController < ApplicationController
  include PracticeScope

  def show
    authorize :practice, :show?
    @question        = PracticeQueue.new(Current.user).next_question(lesson: practice_lesson)
    @progress        = build_progress
    @daily_completed = practice_lesson.nil? && Current.user.today_activity.core_completed?
  end

  private

  def build_progress
    if practice_lesson
      practice_lesson.progress_for(Current.user).merge(caption: practice_lesson.title)
    else
      activity = Current.user.today_activity
      { done: activity.core_done, total: activity.core_goal, caption: "今日の目標" }
    end
  end
end
