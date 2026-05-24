# frozen_string_literal: true

require "test_helper"

class CoursePolicyTest < ActiveSupport::TestCase
  setup do
    @general   = users(:general)
    @admin     = users(:admin)
    @published = courses(:ip_strategy)

    @unpublished = Course.create!(
      certification: certifications(:ip),
      title:         "非公開コース",
      is_published:  false,
      position:      99
    )
  end

  # 未ログインは published コースを show できる
  test "未ログインは published コースを show できる" do
    assert CoursePolicy.new(nil, @published).show?
  end

  # 未ログインは unpublished コースを show できない
  test "未ログインは unpublished コースを show できない" do
    refute CoursePolicy.new(nil, @unpublished).show?
  end

  # 一般ユーザーは published コースを show できる
  test "一般ユーザーは published コースを show できる" do
    assert CoursePolicy.new(@general, @published).show?
  end

  # 一般ユーザーは unpublished コースを show できない
  test "一般ユーザーは unpublished コースを show できない" do
    refute CoursePolicy.new(@general, @unpublished).show?
  end

  # 一般ユーザーは create できない
  test "一般ユーザーは create できない" do
    refute CoursePolicy.new(@general, Course.new).create?
  end

  # 一般ユーザーは update できない
  test "一般ユーザーは update できない" do
    refute CoursePolicy.new(@general, @published).update?
  end

  # 一般ユーザーは destroy できない
  test "一般ユーザーは destroy できない" do
    refute CoursePolicy.new(@general, @published).destroy?
  end

  # admin は unpublished コースも show できる
  test "admin は unpublished コースも show できる" do
    assert CoursePolicy.new(@admin, @unpublished).show?
  end

  # admin は create できる
  test "admin は create できる" do
    assert CoursePolicy.new(@admin, Course.new).create?
  end

  # admin は update できる
  test "admin は update できる" do
    assert CoursePolicy.new(@admin, @published).update?
  end

  # admin は destroy できる
  test "admin は destroy できる" do
    assert CoursePolicy.new(@admin, @published).destroy?
  end

  # Scope は published のみ返す
  test "Scope#resolve は一般ユーザーに published コースのみ返す" do
    scope = CoursePolicy::Scope.new(@general, Course).resolve
    assert_includes scope, @published
    refute_includes scope, @unpublished
  end

  # admin の Scope は全件返す
  test "Scope#resolve は admin に全件返す" do
    scope = CoursePolicy::Scope.new(@admin, Course).resolve
    assert_includes scope, @published
    assert_includes scope, @unpublished
  end
end
