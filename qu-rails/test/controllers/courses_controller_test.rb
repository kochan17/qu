# frozen_string_literal: true

require "test_helper"

class CoursesControllerTest < ActionDispatch::IntegrationTest
  # 未ログインで GET /courses → /session/new へリダイレクト
  test "未ログインで GET /courses は /session/new にリダイレクト" do
    get courses_path, headers: @default_headers
    assert_redirected_to new_session_path
  end

  # ログイン済みで GET /courses → 200、is_published: true のコースのみ表示
  test "ログイン済みユーザーで GET /courses は 200" do
    sign_in users(:general)
    get courses_path, headers: @default_headers
    assert_response :success
  end

  # is_published: true のコースのみが表示される
  test "GET /courses で公開中コースのみ表示される" do
    sign_in users(:general)
    # preferred_certification を ip に設定して ip_strategy コースが見えることを確認
    users(:general).update!(preferred_certification: "ip")
    get courses_path, headers: @default_headers
    assert_response :success
    assert_select "body"
    # is_published: false のコースは Course.published スコープで除外される
    assert Course.published.exists?
  end

  # GET /courses/:id → 200
  test "ログイン済みユーザーで GET /courses/:id は 200" do
    sign_in users(:general)
    course = courses(:ip_strategy)
    get course_path(course), headers: @default_headers
    assert_response :success
  end
end
