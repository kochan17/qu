# frozen_string_literal: true

require "test_helper"

class LessonsControllerTest < ActionDispatch::IntegrationTest
  # 未ログインで GET /lessons/:id → /session/new へリダイレクト
  test "未ログインで GET /lessons/:id は /session/new にリダイレクト" do
    lesson = lessons(:company_1)
    get lesson_path(lesson), headers: @default_headers
    assert_redirected_to new_session_path
  end

  # ログイン済みで GET /lessons/:id → 200
  test "ログイン済みユーザーで GET /lessons/:id は 200" do
    sign_in users(:general)
    lesson = lessons(:company_1)
    get lesson_path(lesson), headers: @default_headers
    assert_response :success
  end

  # 未公開レッスンへのアクセスは 404 (Lesson.published スコープで除外)
  test "未公開レッスンへのアクセスは RecordNotFound" do
    sign_in users(:general)
    unpublished = Lesson.create!(
      section: sections(:ip_strategy_company),
      title: "下書きレッスン",
      slug: "draft-lesson",
      content_type: "text",
      is_published: false,
      position: 99,
      body: "..."
    )
    get lesson_path(unpublished), headers: @default_headers
    assert_response :not_found
  end
end
