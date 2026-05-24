# frozen_string_literal: true

require "test_helper"

class RegistrationsControllerTest < ActionDispatch::IntegrationTest
  # GET /registration/new → 200
  test "GET /registration/new は 200" do
    get new_registration_path, headers: @default_headers
    assert_response :success
  end

  # 正常な POST → User が +1 かつ自動ログイン（セッション成立）
  test "正常な POST /registration は User を作成しセッションを開始してリダイレクト" do
    assert_difference "User.count", 1 do
      post registration_path,
           params: { user: { email_address: "newuser@example.test", password: "password5678", password_confirmation: "password5678", display_name: "新規ユーザー" } },
           headers: @default_headers
    end
    # ログイン済みトップページへリダイレクト
    assert_response :redirect
    follow_redirect!
    assert_response :success
  end

  # パスワードが 11 文字以下で POST → 422
  test "パスワードが 11 文字以下の POST /registration は 422" do
    post registration_path,
         params: { user: { email_address: "shortpw@example.test", password: "short12345", password_confirmation: "short12345" } },
         headers: @default_headers
    assert_response :unprocessable_entity
  end

  # 既存メールアドレスで POST → 422
  test "既存 email で POST /registration は 422" do
    post registration_path,
         params: { user: { email_address: users(:general).email_address, password: "password5678", password_confirmation: "password5678" } },
         headers: @default_headers
    assert_response :unprocessable_entity
  end
end
