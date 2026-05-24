class ApplicationController < ActionController::Base
  include Authentication
  include Pundit::Authorization

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  # 認証より先にチェックする（unauthenticated でも吸い出された token は記録したい）。
  prepend_before_action :check_canary_tokens

  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  # テスト環境は IntegrationTest の既定リクエストに UA が無くフィルタが 404 を返してしまうため除外。
  allow_browser versions: :modern unless Rails.env.test?

  before_action :enforce_otp_step

  after_action :verify_authorized,    except: :index
  after_action :verify_policy_scoped, only:   :index

  # 偽認証情報（Canarytoken）が外部に流出したケースを検出する。
  # `.canary-tokens.yml` で定義した値がリクエストパラメータに混入していたら audit する。
  CANARY_TOKENS = %w[
    qu_canary_db_pwd_8a3f9e
    qu_canary_admin_token_2b7c1d
    qu_canary_master_key_4f6d2a
  ].freeze

  private

  # 将来 admin 配下にコントローラを増やしても誤って除外されないよう controller_path で判定する。
  OTP_EXEMPT_CONTROLLER_PATHS = %w[sessions registrations passwords otp_challenges otps].freeze
  private_constant :OTP_EXEMPT_CONTROLLER_PATHS

  def enforce_otp_step
    return if OTP_EXEMPT_CONTROLLER_PATHS.include?(controller_path)

    if session[:otp_pending]
      redirect_to new_otp_challenge_path
    elsif session[:otp_setup_required]
      redirect_to new_otp_path
    end
  end

  def pundit_user
    Current.user
  end

  def user_not_authorized
    redirect_back fallback_location: root_path
  end

  def check_canary_tokens
    # 巨大 multipart アップロードはパラメータ走査をスキップし、ヘッダだけ検査する。
    param_values = if request.content_length.to_i > 1.megabyte
      []
    else
      params.values.flat_map { |v| v.is_a?(String) ? [v] : [] }
    end

    joined = param_values.join(" ") + " " +
             request.headers["Authorization"].to_s + " " +
             request.headers["Cookie"].to_s
    tripped = CANARY_TOKENS.find { |t| joined.include?(t) }
    return unless tripped

    AuditLog.record!("canary.token_tripped", request: request,
      payload: { token_id: tripped.split("_").last(2).join("_") })
  end
end
