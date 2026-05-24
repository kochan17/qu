# frozen_string_literal: true

require "test_helper"

class QuizResultPolicyTest < ActiveSupport::TestCase
  setup do
    @general    = users(:general)
    @other_user = users(:admin_with_otp)
    @admin      = users(:admin)
    @own_result   = quiz_results(:general_correct)
    @other_result = QuizResult.create!(
      user:               @other_user,
      question:           questions(:company_1_q1),
      is_correct:         true,
      selected_choice_id: "a"
    )
  end

  # 一般ユーザーは自分の QuizResult を show できる
  test "一般ユーザーは自分の QuizResult を show できる" do
    assert QuizResultPolicy.new(@general, @own_result).show?
  end

  # 一般ユーザーは他人の QuizResult を show できない
  test "一般ユーザーは他人の QuizResult を show できない" do
    refute QuizResultPolicy.new(@general, @other_result).show?
  end

  # 一般ユーザーは自分の QuizResult を update できる
  test "一般ユーザーは自分の QuizResult を update できる" do
    assert QuizResultPolicy.new(@general, @own_result).update?
  end

  # 一般ユーザーは他人の QuizResult を update できない
  test "一般ユーザーは他人の QuizResult を update できない" do
    refute QuizResultPolicy.new(@general, @other_result).update?
  end

  # 一般ユーザーは自分の QuizResult を destroy できる
  test "一般ユーザーは自分の QuizResult を destroy できる" do
    assert QuizResultPolicy.new(@general, @own_result).destroy?
  end

  # 一般ユーザーは他人の QuizResult を destroy できない
  test "一般ユーザーは他人の QuizResult を destroy できない" do
    refute QuizResultPolicy.new(@general, @other_result).destroy?
  end

  # admin は他人の QuizResult にも全権を持つ
  test "admin は他人の QuizResult を show できる" do
    assert QuizResultPolicy.new(@admin, @other_result).show?
  end

  # admin は他人の QuizResult を update できる
  test "admin は他人の QuizResult を update できる" do
    assert QuizResultPolicy.new(@admin, @other_result).update?
  end

  # admin は他人の QuizResult を destroy できる
  test "admin は他人の QuizResult を destroy できる" do
    assert QuizResultPolicy.new(@admin, @other_result).destroy?
  end

  # Scope は自分のレコードのみ返す
  test "Scope#resolve は一般ユーザーに自分のレコードのみ返す" do
    scope = QuizResultPolicy::Scope.new(@general, QuizResult).resolve
    assert_includes scope, @own_result
    refute_includes scope, @other_result
  end

  # admin の Scope は全件返す
  test "Scope#resolve は admin に全件返す" do
    scope = QuizResultPolicy::Scope.new(@admin, QuizResult).resolve
    assert_includes scope, @own_result
    assert_includes scope, @other_result
  end

  # 未ログインの Scope は空を返す
  test "Scope#resolve は未ログインに空を返す" do
    scope = QuizResultPolicy::Scope.new(nil, QuizResult).resolve
    assert_equal 0, scope.count
  end
end
