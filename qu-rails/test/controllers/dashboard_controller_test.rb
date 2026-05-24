# frozen_string_literal: true

require "test_helper"

class DashboardControllerTest < ActionDispatch::IntegrationTest
  # 未ログインで GET / → セッション新規作成ページへリダイレクト
  test "未ログインで GET / は /session/new にリダイレクト" do
    get root_path, headers: @default_headers
    assert_redirected_to new_session_path
  end

  # ログイン済み一般ユーザーで GET / → 200
  test "ログイン済みユーザーで GET / は 200" do
    sign_in users(:general)
    get root_path, headers: @default_headers
    assert_response :success
  end
end
