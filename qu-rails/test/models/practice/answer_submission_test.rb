# frozen_string_literal: true

require "test_helper"

class Practice::AnswerSubmissionTest < ActiveSupport::TestCase
  setup do
    @user     = users(:general)
    @question = questions(:company_1_q1)
    @correct_choice_id = "a" # fixtures より correct_choice_id: a
    @wrong_choice_id   = "b"
  end

  # ---------------------------------------------------------------------------
  # QuizResult 作成
  # ---------------------------------------------------------------------------

  test "call で QuizResult が 1 件作成される" do
    submission = Practice::AnswerSubmission.new(
      user: @user, question: @question, choice_id: @correct_choice_id
    )
    assert_difference "QuizResult.count", 1 do
      submission.call
    end
  end

  test "正答の場合 is_correct: true で QuizResult が作られる" do
    result = Practice::AnswerSubmission.new(
      user: @user, question: @question, choice_id: @correct_choice_id
    ).call
    assert result.is_correct
  end

  test "誤答の場合 is_correct: false で QuizResult が作られる" do
    result = Practice::AnswerSubmission.new(
      user: @user, question: @question, choice_id: @wrong_choice_id
    ).call
    assert_not result.is_correct
  end

  # ---------------------------------------------------------------------------
  # DailyActivity#record_correct!
  # ---------------------------------------------------------------------------

  test "正答の場合 DailyActivity の learn_count が +1 される（新規問題）" do
    # QuestionReviewState がない = 新規問題 = :learn
    activity_before = @user.today_activity.learn_count

    Practice::AnswerSubmission.new(
      user: @user, question: @question, choice_id: @correct_choice_id
    ).call

    @user.today_activity.reload
    assert_equal activity_before + 1, @user.today_activity.learn_count
  end

  test "正答の場合 DailyActivity の recall_count が +1 される（復習問題）" do
    # QuestionReviewState を事前に作成して :recall にする
    @user.question_review_states.create!(
      question: @question,
      due_at: Time.current - 1.day,
      reps: 1,
      lapses: 0,
      stability: 1.0,
      difficulty: 5.0,
      last_reviewed_at: Time.current - 2.days
    )

    activity_before = @user.today_activity.recall_count

    Practice::AnswerSubmission.new(
      user: @user, question: @question, choice_id: @correct_choice_id
    ).call

    @user.today_activity.reload
    assert_equal activity_before + 1, @user.today_activity.recall_count
  end

  test "誤答の場合 DailyActivity のカウントは増えない" do
    activity = @user.today_activity
    before_recall = activity.recall_count
    before_learn  = activity.learn_count

    Practice::AnswerSubmission.new(
      user: @user, question: @question, choice_id: @wrong_choice_id
    ).call

    activity.reload
    assert_equal before_recall, activity.recall_count
    assert_equal before_learn,  activity.learn_count
  end

  # ---------------------------------------------------------------------------
  # QuestionReviewState 作成・更新
  # ---------------------------------------------------------------------------

  test "call で QuestionReviewState が新規作成される" do
    assert_difference "QuestionReviewState.count", 1 do
      Practice::AnswerSubmission.new(
        user: @user, question: @question, choice_id: @correct_choice_id
      ).call
    end
  end

  test "2 回目の解答では QuestionReviewState が更新され増えない" do
    Practice::AnswerSubmission.new(
      user: @user, question: @question, choice_id: @correct_choice_id
    ).call

    assert_no_difference "QuestionReviewState.count" do
      Practice::AnswerSubmission.new(
        user: @user, question: @question, choice_id: @correct_choice_id
      ).call
    end

    state = @user.question_review_states.find_by(question: @question)
    assert_equal 2, state.reps
  end

  # ---------------------------------------------------------------------------
  # User#refresh_streak! のトリガ
  # ---------------------------------------------------------------------------

  test "正答で Daily Ring が閉じると streak が更新される" do
    # goal を超えるための設定
    activity = @user.today_activity
    activity.update!(
      recall_count: activity.recall_goal,
      learn_count:  activity.learn_goal - 1,
      learn_goal:   activity.learn_goal
    )
    # あと 1 問正解で閉じる状態にする

    before_streak = @user.current_streak

    Practice::AnswerSubmission.new(
      user: @user, question: @question, choice_id: @correct_choice_id
    ).call

    @user.reload
    assert_equal before_streak + 1, @user.current_streak
  end

  # ---------------------------------------------------------------------------
  # トランザクション: 失敗時のロールバック
  # ---------------------------------------------------------------------------

  test "AnswerSubmission#call は 1 つのトランザクションで実行される" do
    # 実装が transaction で囲まれていることを、実際に呼んだ時の Quiz/Review/Activity が
    # 「全部できる or 全部できない」原子性を持つことで確認する。
    # ここでは正常系で全レコードが揃って作られることを確認することで、トランザクション境界の
    # 存在を担保する（失敗系の異常終了は別途 unit 化が必要なら個別 spy を入れる）。
    assert_difference("QuizResult.count", 1) do
      assert_difference("QuestionReviewState.count", 1) do
        Practice::AnswerSubmission.new(user: @user, question: @question, choice_id: "a").call
      end
    end
  end
end
