# frozen_string_literal: true

require "test_helper"

class PracticeControllerTest < ActionDispatch::IntegrationTest
  # 未ログインで GET /practice → /session/new にリダイレクト
  test "未ログインで GET /practice は /session/new にリダイレクト" do
    get practice_path, headers: @default_headers
    assert_redirected_to new_session_path
  end

  # ログイン済み一般ユーザーで GET /practice → 200
  test "ログイン済みユーザーで GET /practice は 200" do
    sign_in users(:general)
    get practice_path, headers: @default_headers
    assert_response :success
  end

  # preferred_certification 未設定でも GET /practice → 200
  test "preferred_certification 未設定ユーザーで GET /practice は 200" do
    sign_in users(:general)
    users(:general).update!(preferred_certification: nil)
    get practice_path, headers: @default_headers
    assert_response :success
  end
end
