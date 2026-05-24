# frozen_string_literal: true

# 1 問の解答を記録する。記録処理は Practice::AnswerSubmission に委譲する。
class QuizResultsController < ApplicationController
  include PracticeScope

  def create
    question = fetch_submitted_question!
    authorize question, :show?

    @result   = Practice::AnswerSubmission.new(
      user:      Current.user,
      question:  question,
      choice_id: params[:selected_choice_id]
    ).call
    @progress = build_progress
  end

  private

  def fetch_submitted_question!
    question = PracticeQueue.new(Current.user).next_question(lesson: practice_lesson)
    raise ActiveRecord::RecordNotFound if question.nil? || question.id.to_s != params[:question_id].to_s

    question
  end

  def build_progress
    if practice_lesson
      practice_lesson.progress_for(Current.user).merge(caption: practice_lesson.title)
    else
      activity = Current.user.today_activity
      { done: activity.core_done, total: activity.core_goal, caption: "今日の目標" }
    end
  end
end
