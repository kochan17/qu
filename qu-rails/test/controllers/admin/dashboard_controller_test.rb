# frozen_string_literal: true

require "test_helper"

class Admin::DashboardControllerTest < ActionDispatch::IntegrationTest
  # 一般ユーザーは管理画面に入れない（require_admin で root へ）
  test "一般ユーザーで GET /admin は root へリダイレクト" do
    sign_in users(:general)
    get admin_root_path, headers: @default_headers
    assert_redirected_to root_path
  end

  # 未ログインは認証必須で /session/new へ
  test "未ログインで GET /admin は /session/new にリダイレクト" do
    get admin_root_path, headers: @default_headers
    assert_redirected_to new_session_path
  end

  # OTP 未設定 admin は enforce_otp_step によって /otp/new へ強制誘導される
  test "OTP 未設定 admin はログイン直後 GET /admin で /otp/new にリダイレクト" do
    sign_in users(:admin)
    get admin_root_path, headers: @default_headers
    assert_redirected_to new_otp_path
  end

  # OTP 設定済み admin は challenge 通過後に管理画面に入れる
  test "OTP 設定済み admin は challenge 通過後 GET /admin で 200" do
    admin = users(:admin_with_otp)
    totp = ROTP::TOTP.new(admin.otp_secret, issuer: "Qu")
    sign_in_admin_with_otp(admin, otp_code: totp.now)
    get admin_root_path, headers: @default_headers
    assert_response :success
  end
end
