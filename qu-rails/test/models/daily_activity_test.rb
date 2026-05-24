# frozen_string_literal: true

require "test_helper"

class DailyActivityTest < ActiveSupport::TestCase
  # ---------------------------------------------------------------------------
  # バリデーション
  # ---------------------------------------------------------------------------

  test "user_id と date の組が重複していると無効" do
    existing = daily_activities(:general_today)
    dup = DailyActivity.new(user_id: existing.user_id, date: existing.date,
                            recall_goal: 3, learn_goal: 7)
    assert_not dup.valid?
    assert dup.errors.added?(:date, :taken, value: existing.date)
  end

  test "recall_goal が 0 以下だと無効" do
    activity = DailyActivity.new(user: users(:admin), date: Date.current,
                                 recall_goal: 0, learn_goal: 7)
    assert_not activity.valid?
    assert activity.errors[:recall_goal].present?
  end

  test "learn_goal が 0 以下だと無効" do
    activity = DailyActivity.new(user: users(:admin), date: Date.current,
                                 recall_goal: 3, learn_goal: 0)
    assert_not activity.valid?
    assert activity.errors[:learn_goal].present?
  end

  # ---------------------------------------------------------------------------
  # record_correct!
  # ---------------------------------------------------------------------------

  test "record_correct!(:recall) で recall_count が +1 される" do
    activity = daily_activities(:general_today)
    before = activity.recall_count

    assert_difference -> { activity.reload.recall_count }, 1 do
      activity.record_correct!(:recall)
    end
  end

  test "record_correct!(:learn) で learn_count が +1 される" do
    activity = daily_activities(:general_today)
    before = activity.learn_count

    assert_difference -> { activity.reload.learn_count }, 1 do
      activity.record_correct!(:learn)
    end
  end

  test "record_correct! に未知の kind を渡すと ArgumentError" do
    activity = daily_activities(:general_today)
    assert_raises ArgumentError do
      activity.record_correct!(:unknown)
    end
  end

  # ---------------------------------------------------------------------------
  # completed 生成列
  # ---------------------------------------------------------------------------

  test "recall_count + learn_count が goal を満たすと completed が true になる" do
    activity = daily_activities(:general_today)
    # goal に達するまで加算
    (activity.recall_goal - activity.recall_count).times { activity.record_correct!(:recall) }
    (activity.learn_goal  - activity.learn_count).times  { activity.record_correct!(:learn) }

    activity.reload
    # DB の STORED 生成列が反映されていることを確認
    assert activity.completed, "recall+learn が goal を満たしたら completed=true であるべき"
  end

  test "goal を満たしていないと completed が false" do
    activity = daily_activities(:general_today)
    # fixture の recall_count=0, learn_count=0 なので goal 未達
    activity.reload
    assert_not activity.completed
  end

  # ---------------------------------------------------------------------------
  # core_completed?
  # ---------------------------------------------------------------------------

  test "core_completed? は recall+learn >= goal で true を返す" do
    activity = daily_activities(:general_today)
    activity.update!(recall_count: activity.recall_goal, learn_count: activity.learn_goal)
    assert activity.core_completed?
  end

  test "core_completed? は goal 未達で false を返す" do
    activity = daily_activities(:general_today)
    assert_not activity.core_completed?
  end
end
