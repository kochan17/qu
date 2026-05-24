# frozen_string_literal: true

require "test_helper"

class LessonCompletionPolicyTest < ActiveSupport::TestCase
  setup do
    @general    = users(:general)
    @other_user = users(:admin_with_otp)
    @admin      = users(:admin)
    @own_completion   = lesson_completions(:general_company_1)
    @other_completion = LessonCompletion.create!(
      user:   @other_user,
      lesson: lessons(:company_2)
    )
  end

  # 一般ユーザーは自分の LessonCompletion を show できる
  test "一般ユーザーは自分の LessonCompletion を show できる" do
    assert LessonCompletionPolicy.new(@general, @own_completion).show?
  end

  # 一般ユーザーは他人の LessonCompletion を show できない
  test "一般ユーザーは他人の LessonCompletion を show できない" do
    refute LessonCompletionPolicy.new(@general, @other_completion).show?
  end

  # 一般ユーザーは自分の LessonCompletion を create できる
  test "一般ユーザーは LessonCompletion を create できる" do
    assert LessonCompletionPolicy.new(@general, LessonCompletion.new).create?
  end

  # 一般ユーザーは自分の LessonCompletion を update できる
  test "一般ユーザーは自分の LessonCompletion を update できる" do
    assert LessonCompletionPolicy.new(@general, @own_completion).update?
  end

  # 一般ユーザーは他人の LessonCompletion を update できない
  test "一般ユーザーは他人の LessonCompletion を update できない" do
    refute LessonCompletionPolicy.new(@general, @other_completion).update?
  end

  # 一般ユーザーは自分の LessonCompletion を destroy できる
  test "一般ユーザーは自分の LessonCompletion を destroy できる" do
    assert LessonCompletionPolicy.new(@general, @own_completion).destroy?
  end

  # 一般ユーザーは他人の LessonCompletion を destroy できない
  test "一般ユーザーは他人の LessonCompletion を destroy できない" do
    refute LessonCompletionPolicy.new(@general, @other_completion).destroy?
  end

  # admin は他人のレコードにも全権を持つ
  test "admin は他人の LessonCompletion を show できる" do
    assert LessonCompletionPolicy.new(@admin, @other_completion).show?
  end

  # admin は destroy できる
  test "admin は他人の LessonCompletion を destroy できる" do
    assert LessonCompletionPolicy.new(@admin, @other_completion).destroy?
  end

  # Scope は自分のレコードのみ返す
  test "Scope#resolve は一般ユーザーに自分のレコードのみ返す" do
    scope = LessonCompletionPolicy::Scope.new(@general, LessonCompletion).resolve
    assert_includes scope, @own_completion
    refute_includes scope, @other_completion
  end

  # admin の Scope は全件返す
  test "Scope#resolve は admin に全件返す" do
    scope = LessonCompletionPolicy::Scope.new(@admin, LessonCompletion).resolve
    assert_includes scope, @own_completion
    assert_includes scope, @other_completion
  end
end
