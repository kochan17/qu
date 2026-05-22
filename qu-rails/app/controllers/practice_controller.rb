# frozen_string_literal: true

# 演習画面。次に出題する1問を FSRS-5 由来のキューから選び表示する。
# cron は使わず、リクエストのたびにリアルタイムで次の1問を計算する。
class PracticeController < ApplicationController
  include PracticeScope

  def show
    @progress        = practice_progress
    @question        = next_question
    @daily_completed = practice_lesson.nil? && today_activity.core_completed?
  end

  private

  def next_question
    practice_lesson ? next_lesson_question : next_daily_question
  end

  # レッスン単位: まだ正答していない問題を position 順に出す。
  def next_lesson_question
    questions = practice_lesson.questions.published.ordered.to_a
    mastered  = Current.user.quiz_results
                       .where(question_id: questions.map(&:id), is_correct: true)
                       .distinct.pluck(:question_id)
    questions.find { |q| mastered.exclude?(q.id) }
  end

  # 今日のキュー: 期限が来た復習問題を優先、その後に未学習の新規問題。
  def next_daily_question
    certification = Certification.published.find_by(slug: Current.user.preferred_certification)
    return nil if certification.nil?

    question_ids = Question.for_certification(certification).ids
    return nil if question_ids.empty?

    due = Current.user.question_review_states
                 .due.where(question_id: question_ids)
                 .order(:due_at).includes(:question).first
    return due.question if due

    reviewed_ids = Current.user.question_review_states
                          .where(question_id: question_ids).pluck(:question_id)
    Question.where(id: question_ids - reviewed_ids).in_content_order.first
  end
end
