# frozen_string_literal: true

# 1 問の解答を記録する。FSRS-5 の復習状態更新・Daily Ring・ストリークを
# コントローラで順に呼び出して調停する（cross-model 副作用 callback は持たない）。
class QuizResultsController < ApplicationController
  include PracticeScope

  def create
    @question           = Question.published.find(params[:question_id])
    @selected_choice_id = params[:selected_choice_id].to_s.presence
    @correct            = @question.correct?(@selected_choice_id)

    review_state = Current.user.question_review_states.find_or_initialize_by(question: @question)
    kind         = review_state.new_record? ? :learn : :recall

    Current.user.quiz_results.create!(
      question:           @question,
      selected_choice_id: @selected_choice_id,
      is_correct:         @correct
    )
    review_state.apply_review!(correct: @correct)

    if @correct
      activity = Current.user.daily_activities.find_or_create_by!(date: Date.current)
      activity.record_correct!(kind)
      Current.user.refresh_streak!
    end

    @progress = practice_progress

    respond_to do |format|
      format.turbo_stream
      format.html { redirect_to practice_path(lesson_id: practice_lesson&.id) }
    end
  end
end
