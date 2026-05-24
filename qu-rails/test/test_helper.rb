ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all
  end
end

# IntegrationTest 全体で使うログインヘルパと UA ヘッダ。
# phase_two_security_test.rb と同じパターンを共通化する。
class ActionDispatch::IntegrationTest
  MODERN_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

  setup do
    @default_headers = { "HTTP_USER_AGENT" => MODERN_UA }
  end

  # fixture ユーザーでセッションを開始する。
  def sign_in(user, password: "password1234")
    post session_path,
         params: { login_form: { email_address: user.email_address, password: } },
         headers: @default_headers
  end

  # OTP 有効化済み admin 用：ログイン → OTP challenge 通過まで一括実行する。
  def sign_in_admin_with_otp(admin, otp_code:, password: "password1234")
    post session_path,
         params: { login_form: { email_address: admin.email_address, password: } },
         headers: @default_headers
    post otp_challenge_path, params: { code: otp_code }, headers: @default_headers
  end
end
