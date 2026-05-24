# frozen_string_literal: true

require "test_helper"

class DailyActivityPolicyTest < ActiveSupport::TestCase
  setup do
    @general    = users(:general)
    @other_user = users(:admin_with_otp)
    @admin      = users(:admin)
    @own_activity   = daily_activities(:general_today)
    @other_activity = DailyActivity.create!(
      user:         @other_user,
      date:         Date.current - 1,
      recall_count: 0,
      learn_count:  0,
      recall_goal:  3,
      learn_goal:   7
    )
  end

  # 一般ユーザーは自分の DailyActivity を show できる
  test "一般ユーザーは自分の DailyActivity を show できる" do
    assert DailyActivityPolicy.new(@general, @own_activity).show?
  end

  # 一般ユーザーは他人の DailyActivity を show できない
  test "一般ユーザーは他人の DailyActivity を show できない" do
    refute DailyActivityPolicy.new(@general, @other_activity).show?
  end

  # 一般ユーザーは自分の DailyActivity を update できる
  test "一般ユーザーは自分の DailyActivity を update できる" do
    assert DailyActivityPolicy.new(@general, @own_activity).update?
  end

  # 一般ユーザーは他人の DailyActivity を update できない
  test "一般ユーザーは他人の DailyActivity を update できない" do
    refute DailyActivityPolicy.new(@general, @other_activity).update?
  end

  # 一般ユーザーは自分の DailyActivity を destroy できる
  test "一般ユーザーは自分の DailyActivity を destroy できる" do
    assert DailyActivityPolicy.new(@general, @own_activity).destroy?
  end

  # 一般ユーザーは他人の DailyActivity を destroy できない
  test "一般ユーザーは他人の DailyActivity を destroy できない" do
    refute DailyActivityPolicy.new(@general, @other_activity).destroy?
  end

  # admin は他人の DailyActivity を show できる
  test "admin は他人の DailyActivity を show できる" do
    assert DailyActivityPolicy.new(@admin, @other_activity).show?
  end

  # admin は他人の DailyActivity を destroy できる
  test "admin は他人の DailyActivity を destroy できる" do
    assert DailyActivityPolicy.new(@admin, @other_activity).destroy?
  end

  # Scope は自分のレコードのみ返す
  test "Scope#resolve は一般ユーザーに自分のレコードのみ返す" do
    scope = DailyActivityPolicy::Scope.new(@general, DailyActivity).resolve
    assert_includes scope, @own_activity
    refute_includes scope, @other_activity
  end

  # admin の Scope は全件返す
  test "Scope#resolve は admin に全件返す" do
    scope = DailyActivityPolicy::Scope.new(@admin, DailyActivity).resolve
    assert_includes scope, @own_activity
    assert_includes scope, @other_activity
  end
end
