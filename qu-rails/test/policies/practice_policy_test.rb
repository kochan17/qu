# frozen_string_literal: true

require "test_helper"

class PracticePolicyTest < ActiveSupport::TestCase
  setup do
    @general = users(:general)
  end

  # 一般ユーザーは index できる（PracticePolicy は show? のみ定義）
  test "一般ユーザーは show できる" do
    assert PracticePolicy.new(@general, nil).show?
  end

  # 未ログインは show できない
  test "未ログインは show できない" do
    refute PracticePolicy.new(nil, nil).show?
  end

  # ApplicationPolicy のデフォルトで index? は false
  test "index? は false（ApplicationPolicy デフォルト）" do
    refute PracticePolicy.new(@general, nil).index?
  end
end
