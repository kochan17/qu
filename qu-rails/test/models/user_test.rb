# frozen_string_literal: true

require "test_helper"

class UserTest < ActiveSupport::TestCase
  # ---------------------------------------------------------------------------
  # バリデーション
  # ---------------------------------------------------------------------------

  test "email_address が空だと無効" do
    user = User.new(email_address: "", password: "password1234", password_confirmation: "password1234")
    assert_not user.valid?
    assert user.errors.added?(:email_address, :blank)
  end

  test "email_address が重複していると無効" do
    existing = users(:general)
    user = User.new(email_address: existing.email_address, password: "password1234", password_confirmation: "password1234")
    assert_not user.valid?
  end

  test "password が 12 文字未満だと無効" do
    user = User.new(email_address: "new@example.test", password: "short", password_confirmation: "short")
    assert_not user.valid?
    assert user.errors.added?(:password, :too_short, count: 12)
  end

  test "password が 12 文字以上だと有効" do
    user = User.new(email_address: "new@example.test", password: "password1234", password_confirmation: "password1234")
    assert user.valid?
  end

  # ---------------------------------------------------------------------------
  # enum role
  # ---------------------------------------------------------------------------

  test "role に user が指定できる" do
    user = users(:general)
    assert user.user?
    assert_not user.admin?
  end

  test "role に admin が指定できる" do
    user = users(:admin)
    assert user.admin?
    assert_not user.user?
  end

  # ---------------------------------------------------------------------------
  # TOTP
  # ---------------------------------------------------------------------------

  test "ensure_otp_secret! で otp_secret が発行される" do
    user = users(:general)
    assert_nil user.otp_secret

    secret = user.ensure_otp_secret!
    assert_not_nil secret
    user.reload
    assert_equal secret, user.otp_secret
  end

  test "ensure_otp_secret! を再呼び出ししても上書きされない" do
    user = users(:general)
    first_secret = user.ensure_otp_secret!
    second_secret = user.ensure_otp_secret!
    assert_equal first_secret, second_secret
  end

  test "verify_otp が正しいコードで true を返す" do
    user = users(:admin_with_otp)
    code = ROTP::TOTP.new(user.otp_secret, issuer: "Qu").now
    assert user.verify_otp(code)
  end

  test "verify_otp が誤ったコードで false を返す" do
    user = users(:admin_with_otp)
    assert_not user.verify_otp("000000")
  end

  test "confirm_otp! で otp_enabled が true になる" do
    user = users(:general)
    user.ensure_otp_secret!
    code = ROTP::TOTP.new(user.otp_secret, issuer: "Qu").now
    user.confirm_otp!(code)
    user.reload
    assert user.otp_enabled?
  end

  test "disable_otp! で otp_enabled が false になり secret が nil になる" do
    user = users(:admin_with_otp)
    assert user.otp_enabled?

    user.disable_otp!
    user.reload
    assert_not user.otp_enabled?
    assert_nil user.otp_secret
  end

  # ---------------------------------------------------------------------------
  # バックアップコード
  # ---------------------------------------------------------------------------

  test "regenerate_backup_codes で 10 個生成され digest が保存される" do
    user = users(:general)
    user.ensure_otp_secret!
    code = ROTP::TOTP.new(user.otp_secret, issuer: "Qu").now
    codes = user.confirm_otp!(code)

    assert_equal 10, codes.length
    user.reload
    assert_equal 10, user.otp_backup_codes_digests.length
  end

  test "consume_backup_code で 1 つ消費されると次は false を返す" do
    user = users(:general)
    user.ensure_otp_secret!
    code = ROTP::TOTP.new(user.otp_secret, issuer: "Qu").now
    backup_codes = user.confirm_otp!(code)

    target = backup_codes.first
    assert user.consume_backup_code(target), "初回は true を返すべき"
    assert_not user.consume_backup_code(target), "2 回目は false を返すべき"
  end

  # ---------------------------------------------------------------------------
  # ロックアウト
  # ---------------------------------------------------------------------------

  test "register_failed_login! を 5 回呼ぶと locked? が true になる" do
    user = users(:general)

    5.times { user.register_failed_login! }

    user.reload
    assert user.locked?
    assert_not_nil user.locked_until
  end

  test "register_successful_login! で failed_login_count が 0 にリセットされる" do
    user = users(:general)
    user.update!(failed_login_count: 3)

    user.register_successful_login!
    user.reload

    assert_equal 0, user.failed_login_count
    assert_nil user.locked_until
  end

  # ---------------------------------------------------------------------------
  # ストリーク
  # ---------------------------------------------------------------------------

  test "today_activity が DailyActivity を find_or_create_by する" do
    user = users(:general)
    # fixture の general_today が既に今日分を持っているので find になる
    assert_no_difference "DailyActivity.count" do
      activity = user.today_activity
      assert_equal Date.current, activity.date
    end
  end

  test "今日の DailyActivity がない場合 today_activity が新規作成する" do
    user = users(:admin)
    # admin には今日の daily_activity fixture がない

    assert_difference "DailyActivity.count", 1 do
      activity = user.today_activity
      assert_equal Date.current, activity.date
    end
  end

  test "refresh_streak! は Daily Ring が閉じていないと更新しない" do
    user = users(:general)
    activity = daily_activities(:general_today)
    # recall_count=0, learn_count=0 なので core_completed? = false

    assert_no_difference -> { user.reload.current_streak } do
      user.refresh_streak!
    end
  end

  test "refresh_streak! は Daily Ring が閉じると streak を +1 する" do
    user = users(:general)
    activity = daily_activities(:general_today)
    # goal を超えるように更新
    activity.update!(recall_count: activity.recall_goal, learn_count: activity.learn_goal)

    before_streak = user.current_streak
    user.refresh_streak!
    user.reload

    assert_equal before_streak + 1, user.current_streak
    assert_equal Date.current, user.last_active_date
  end

  test "refresh_streak! は同じ日に 2 回呼ばれても 1 回しかカウントしない" do
    user = users(:general)
    activity = daily_activities(:general_today)
    activity.update!(recall_count: activity.recall_goal, learn_count: activity.learn_goal)

    user.refresh_streak!
    user.reload
    streak_after_first = user.current_streak

    user.refresh_streak!
    user.reload

    assert_equal streak_after_first, user.current_streak
  end
end
