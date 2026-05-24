# frozen_string_literal: true

require "test_helper"

class SettingsControllerTest < ActionDispatch::IntegrationTest
  # ログイン済みで GET /settings → 200
  test "ログイン済みで GET /settings は 200" do
    sign_in users(:general)
    get settings_path, headers: @default_headers
    assert_response :success
  end

  # PATCH /settings で表示名・通知設定が DB に反映される
  test "PATCH /settings で表示名と通知設定が更新される" do
    sign_in users(:general)
    patch settings_path,
          params: { user: { display_name: "テストユーザー", morning_notification_enabled: true, evening_notification_enabled: false, calm_mode: false } },
          headers: @default_headers
    assert_redirected_to settings_path
    users(:general).reload
    assert_equal "テストユーザー", users(:general).display_name
  end

  # PATCH /settings で preferred_certification が DB に反映される
  test "PATCH /settings で preferred_certification が更新される" do
    sign_in users(:general)
    patch settings_path,
          params: { user: { preferred_certification: "ip", display_name: nil, morning_notification_enabled: false, evening_notification_enabled: false, calm_mode: false } },
          headers: @default_headers
    assert_redirected_to settings_path
    assert_equal "ip", users(:general).reload.preferred_certification
  end

  # PATCH /settings で calm_mode を true に切り替えられる
  test "PATCH /settings で calm_mode を on に切り替えられる" do
    sign_in users(:general)
    patch settings_path,
          params: { user: { calm_mode: true, display_name: nil, morning_notification_enabled: false, evening_notification_enabled: false } },
          headers: @default_headers
    assert_redirected_to settings_path
    assert users(:general).reload.calm_mode?
  end

  # 未ログインで GET /settings → /session/new にリダイレクト
  test "未ログインで GET /settings は /session/new にリダイレクト" do
    get settings_path, headers: @default_headers
    assert_redirected_to new_session_path
  end
end
