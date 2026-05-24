# frozen_string_literal: true

require "test_helper"

class QuizResultsControllerTest < ActionDispatch::IntegrationTest
  # ログイン済み正答 POST /quiz_results → QuizResult が +1、turbo_stream レスポンス
  # 通常演習モード（lesson_id なし）で fresh_question の先頭 company_1_q1 を解答
  test "ログイン済みで正答 POST /quiz_results は turbo_stream を返し QuizResult が増加する" do
    user = users(:general)
    user.update!(preferred_certification: "ip")
    sign_in user
    question = questions(:company_1_q1)

    assert_difference "QuizResult.count", 1 do
      post quiz_results_path(format: :turbo_stream),
           params: { question_id: question.id, selected_choice_id: question.correct_choice_id },
           headers: @default_headers
    end
    assert_response :success
    assert_equal "text/vnd.turbo-stream.html", response.media_type
    result = QuizResult.last
    assert result.is_correct
  end

  # ログイン済み誤答 POST /quiz_results → QuizResult が +1、is_correct: false
  test "ログイン済みで誤答 POST /quiz_results は QuizResult が増加し is_correct が false" do
    user = users(:general)
    user.update!(preferred_certification: "ip")
    sign_in user
    question = questions(:company_1_q1)
    wrong_choice = "b"

    assert_difference "QuizResult.count", 1 do
      post quiz_results_path(format: :turbo_stream),
           params: { question_id: question.id, selected_choice_id: wrong_choice },
           headers: @default_headers
    end
    assert_response :success
    result = QuizResult.last
    assert_not result.is_correct
  end

  # 未ログインで POST /quiz_results → /session/new にリダイレクト
  test "未ログインで POST /quiz_results は /session/new にリダイレクト" do
    question = questions(:company_1_q1)
    post quiz_results_path(format: :turbo_stream),
         params: { question_id: question.id, selected_choice_id: "a" },
         headers: @default_headers
    assert_redirected_to new_session_path
  end
end
