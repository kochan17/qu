# frozen_string_literal: true

# 1 問の解答を記録するドメイン操作。
# QuizResult 作成 / QuestionReviewState#apply_review! / DailyActivity#record_correct! /
# User#refresh_streak! を 1 トランザクションで実行し、QuizResult を返す。
module Practice
  class AnswerSubmission
    def initialize(user:, question:, choice_id:)
      @user      = user
      @question  = question
      @choice_id = choice_id
    end

    def call
      review  = @user.question_review_states.find_or_initialize_by(question: @question)
      kind    = review.new_record? ? :learn : :recall
      correct = @question.correct?(@choice_id)

      ApplicationRecord.transaction do
        result = @user.quiz_results.create!(
          question: @question, selected_choice_id: @choice_id.presence, is_correct: correct
        )
        review.apply_review!(correct: correct)
        if correct
          @user.today_activity.record_correct!(kind)
          @user.refresh_streak!
        end
        result
      end
    end
  end
end
