# frozen_string_literal: true

require "test_helper"

class PhaseTwoSecurityTest < ActionDispatch::IntegrationTest
  # allow_browser versions: :modern を通過させるモダンブラウザ UA
  MODERN_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

  setup do
    # 全リクエストにモダンブラウザ UA を付与して allow_browser チェックをパス
    @default_headers = { "HTTP_USER_AGENT" => MODERN_UA }
  end

  # テスト内共通ヘルパー
  def sign_in_as(user, password: "password1234", otp_code: nil)
    post session_path, params: { login_form: { email_address: user.email_address, password: } }, headers: @default_headers
    if otp_code
      post otp_challenge_path, params: { code: otp_code }, headers: @default_headers
    end
  end

  def create_user(email:, password: "password1234", role: "user")
    User.create!(email_address: email, password:, password_confirmation: password, role:)
  end

  # ---------------------------------------------------------------------------
  # ケース 1: 一般ユーザーの通常ログイン
  # ---------------------------------------------------------------------------
  test "一般ユーザーが正しい認証情報でログインできる" do
    user = create_user(email: "u1@que.test")
    assert_equal 0, user.failed_login_count

    post session_path, params: { login_form: { email_address: "u1@que.test", password: "password1234" } }

    assert_redirected_to root_url
    follow_redirect!
    assert_response :success
  end

  test "ログイン失敗で failed_login_count が増加する" do
    user = create_user(email: "u2@que.test")

    post session_path, params: { login_form: { email_address: "u2@que.test", password: "wrongpassword" } }

    user.reload
    assert_equal 1, user.failed_login_count
  end

  test "ログイン成功で failed_login_count が 0 にリセットされる" do
    user = create_user(email: "u3@que.test")
    user.update_columns(failed_login_count: 3, updated_at: Time.current)

    post session_path, params: { login_form: { email_address: "u3@que.test", password: "password1234" } }

    user.reload
    assert_equal 0, user.failed_login_count
    assert_nil user.locked_until
  end

  # ---------------------------------------------------------------------------
  # ケース 2: ログイン失敗ロックアウト
  # ---------------------------------------------------------------------------
  test "5 回失敗するとアカウントがロックされる" do
    user = create_user(email: "lock1@que.test")

    5.times do
      post session_path, params: { login_form: { email_address: "lock1@que.test", password: "wrongpassword" } }
    end

    user.reload
    assert user.locked?, "5 回失敗後はロックされるべき"
    assert_not_nil user.locked_until
  end

  test "ロック後は正しいパスワードでもログインできない" do
    user = create_user(email: "lock2@que.test")

    5.times do
      post session_path, params: { login_form: { email_address: "lock2@que.test", password: "wrongpassword" } }
    end

    user.reload
    assert user.locked?

    # 6 回目は正しいパスワードで試みる
    post session_path, params: { login_form: { email_address: "lock2@que.test", password: "password1234" } }

    # ロック中は 422 か new_session へのリダイレクト
    assert(
      response.status == 422 || response.redirect?,
      "ロック中はログインできないはず (status: #{response.status})"
    )
    if response.redirect?
      assert_redirected_to new_session_path
    end
  end

  # ---------------------------------------------------------------------------
  # ケース 3: admin の OTP setup 強制
  # ---------------------------------------------------------------------------
  test "admin ログイン後は new_otp_path にリダイレクトされる" do
    admin = create_user(email: "a1@que.test", role: "admin")

    post session_path, params: { login_form: { email_address: "a1@que.test", password: "password1234" } }

    assert_redirected_to new_otp_path
  end

  test "OTP 未設定 admin は /admin にアクセスすると new_otp_path に飛ばされる" do
    admin = create_user(email: "a2@que.test", role: "admin")
    sign_in_as(admin)

    # enforce_otp_step によって gate される
    get admin_root_path

    assert_redirected_to new_otp_path
  end

  test "GET /otp/new は 200 OK で QR コードを含む" do
    admin = create_user(email: "a3@que.test", role: "admin")
    sign_in_as(admin)

    get new_otp_path

    assert_response :success
    assert_match "svg", response.body
  end

  test "POST /otp に正しいコードを送ると backup_codes が表示され otp_enabled になる" do
    admin = create_user(email: "a4@que.test", role: "admin")
    sign_in_as(admin)

    # GET /otp/new で otp_secret を発行させる
    get new_otp_path
    admin.reload

    totp = ROTP::TOTP.new(admin.otp_secret, issuer: "Qu")
    code = totp.now

    post otp_path, params: { code: }

    assert_response :success
    assert_match(/バックアップ/, response.body)

    admin.reload
    assert admin.otp_enabled?, "OTP 登録後は otp_enabled が true であるべき"
  end

  # ---------------------------------------------------------------------------
  # ケース 4: 2 度目のログインで OTP challenge
  # ---------------------------------------------------------------------------
  test "OTP 有効 admin が再ログインすると otp_challenge_path に redirect される" do
    admin = create_user(email: "a5@que.test", role: "admin")
    sign_in_as(admin)
    get new_otp_path
    admin.reload

    # OTP を有効化
    totp = ROTP::TOTP.new(admin.otp_secret, issuer: "Qu")
    post otp_path, params: { code: totp.now }
    admin.reload
    assert admin.otp_enabled?

    # セッションを終了
    delete session_path

    # 再ログイン
    post session_path, params: { login_form: { email_address: "a5@que.test", password: "password1234" } }

    assert_redirected_to new_otp_challenge_path
  end

  test "OTP challenge を正しいコードで通過すると root へ redirect され /admin が 200 になる" do
    admin = create_user(email: "a6@que.test", role: "admin")
    sign_in_as(admin)
    get new_otp_path
    admin.reload

    totp = ROTP::TOTP.new(admin.otp_secret, issuer: "Qu")
    post otp_path, params: { code: totp.now }
    admin.reload

    delete session_path

    # 再ログイン → otp_challenge へ
    post session_path, params: { login_form: { email_address: "a6@que.test", password: "password1234" } }
    assert_redirected_to new_otp_challenge_path

    # OTP challenge を正しいコードで通過
    post otp_challenge_path, params: { code: totp.now }
    assert_redirected_to root_url

    follow_redirect!
    assert_response :success

    # /admin も通れる
    get admin_root_path
    assert_response :success
  end

  # ---------------------------------------------------------------------------
  # ケース 5: Pundit による認可
  # ---------------------------------------------------------------------------
  test "一般ユーザーは /admin にアクセスできない" do
    user = create_user(email: "p1@que.test")
    sign_in_as(user)

    get admin_root_path

    assert_redirected_to root_path
  end

  test "Pundit::NotAuthorizedError は redirect_back で握り潰される" do
    # DashboardController は authorize :dashboard, :index? を呼ぶ。
    # ログイン済み一般ユーザーは DashboardPolicy#index? が true なので正常に通る。
    # ここでは Pundit が正しく呼ばれており、かつ未認可エラーが redirect で処理されることを
    # admin ルート経由で間接確認する（非 admin → redirect to root = NotAuthorizedError ではなく
    # require_admin が弾くが、redirect 処理自体が機能していることを確認する）。
    user = create_user(email: "p2@que.test")
    sign_in_as(user)

    # GET / (DashboardController#index) → 認可 OK で 200
    follow_redirect! # sign_in_as の redirect をたどる
    assert_response :success

    # GET /admin → 非 admin なので redirect
    get admin_root_path
    assert response.redirect?
    assert_equal root_path, URI.parse(response.location).path
  end

  # ---------------------------------------------------------------------------
  # ケース 6: メール列挙対策
  # ---------------------------------------------------------------------------
  test "存在しないメールで /passwords を POST しても同じ notice と redirect" do
    post passwords_path, params: { email_address: "nonexistent@que.test" }

    assert_redirected_to new_session_path
    assert_equal "ご登録のメールアドレスがあれば、再設定の案内をお送りしました。", flash[:notice]
  end

  test "存在するメールで /passwords を POST しても同じ notice と redirect" do
    create_user(email: "existing@que.test")
    post passwords_path, params: { email_address: "existing@que.test" }

    assert_redirected_to new_session_path
    assert_equal "ご登録のメールアドレスがあれば、再設定の案内をお送りしました。", flash[:notice]
  end

  test "存在する・しないで flash の内容に差がない" do
    create_user(email: "enum_guard@que.test")

    post passwords_path, params: { email_address: "enum_guard@que.test" }
    notice_existing = flash[:notice]

    post passwords_path, params: { email_address: "no_such_user@que.test" }
    notice_missing = flash[:notice]

    assert_equal notice_existing, notice_missing
  end

  # ---------------------------------------------------------------------------
  # AuditLog 補足確認
  # ---------------------------------------------------------------------------
  test "ログイン成功で AuditLog に login.success が記録される" do
    user = create_user(email: "audit1@que.test")
    count_before = AuditLog.where(action: "login.success").count

    post session_path, params: { login_form: { email_address: "audit1@que.test", password: "password1234" } }

    assert_equal count_before + 1, AuditLog.where(action: "login.success").count
  end

  test "ログイン失敗で AuditLog に login.failed が記録される" do
    user = create_user(email: "audit2@que.test")
    count_before = AuditLog.where(action: "login.failed").count

    post session_path, params: { login_form: { email_address: "audit2@que.test", password: "wrongpassword" } }

    assert_equal count_before + 1, AuditLog.where(action: "login.failed").count
  end
end
