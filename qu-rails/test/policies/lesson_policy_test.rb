# frozen_string_literal: true

require "test_helper"

class LessonPolicyTest < ActiveSupport::TestCase
  setup do
    @general  = users(:general)
    @admin    = users(:admin)
    @published = lessons(:company_1)

    @unpublished = Lesson.create!(
      section:      sections(:ip_strategy_company),
      title:        "非公開レッスン",
      slug:         "unpublished-lesson-#{SecureRandom.hex(4)}",
      content_type: "text",
      is_published: false,
      position:     99,
      body:         "テスト用"
    )
  end

  # 未ログインユーザーは published レッスンを show できる
  test "未ログインは published レッスンを show できる" do
    assert LessonPolicy.new(nil, @published).show?
  end

  # 未ログインユーザーは unpublished レッスンを show できない
  test "未ログインは unpublished レッスンを show できない" do
    refute LessonPolicy.new(nil, @unpublished).show?
  end

  # 未ログインでも index? は true（PublicContentPolicy）
  test "未ログインは index できる" do
    assert LessonPolicy.new(nil, Lesson).index?
  end

  # 一般ユーザーは published レッスンを show できる
  test "一般ユーザーは published レッスンを show できる" do
    assert LessonPolicy.new(@general, @published).show?
  end

  # 一般ユーザーは unpublished レッスンを show できない
  test "一般ユーザーは unpublished レッスンを show できない" do
    refute LessonPolicy.new(@general, @unpublished).show?
  end

  # 一般ユーザーは create できない
  test "一般ユーザーは create できない" do
    refute LessonPolicy.new(@general, Lesson.new).create?
  end

  # 一般ユーザーは update できない
  test "一般ユーザーは update できない" do
    refute LessonPolicy.new(@general, @published).update?
  end

  # 一般ユーザーは destroy できない
  test "一般ユーザーは destroy できない" do
    refute LessonPolicy.new(@general, @published).destroy?
  end

  # admin は unpublished レッスンも show できる
  test "admin は unpublished レッスンも show できる" do
    assert LessonPolicy.new(@admin, @unpublished).show?
  end

  # admin は create できる
  test "admin は create できる" do
    assert LessonPolicy.new(@admin, Lesson.new).create?
  end

  # admin は update できる
  test "admin は update できる" do
    assert LessonPolicy.new(@admin, @published).update?
  end

  # admin は destroy できる
  test "admin は destroy できる" do
    assert LessonPolicy.new(@admin, @published).destroy?
  end

  # 一般ユーザーの Scope は published のみ返す
  test "Scope#resolve は一般ユーザーに published レッスンのみ返す" do
    scope = LessonPolicy::Scope.new(@general, Lesson).resolve
    assert_includes scope, @published
    refute_includes scope, @unpublished
  end

  # admin の Scope は全件返す
  test "Scope#resolve は admin に全件返す" do
    scope = LessonPolicy::Scope.new(@admin, Lesson).resolve
    assert_includes scope, @published
    assert_includes scope, @unpublished
  end

  # 未ログインの Scope は published のみ返す
  test "Scope#resolve は未ログインに published レッスンのみ返す" do
    scope = LessonPolicy::Scope.new(nil, Lesson).resolve
    assert_includes scope, @published
    refute_includes scope, @unpublished
  end
end
