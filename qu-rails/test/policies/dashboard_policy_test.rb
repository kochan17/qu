# frozen_string_literal: true

require "test_helper"

class DashboardPolicyTest < ActiveSupport::TestCase
  setup do
    @general = users(:general)
    @admin   = users(:admin)
  end

  # 一般ユーザーは index できる
  test "一般ユーザーは index できる" do
    assert DashboardPolicy.new(@general, nil).index?
  end

  # admin も index できる
  test "admin は index できる" do
    assert DashboardPolicy.new(@admin, nil).index?
  end

  # 未ログインは index できない
  test "未ログインは index できない" do
    refute DashboardPolicy.new(nil, nil).index?
  end
end
