class PasswordsController < ApplicationController
  allow_unauthenticated_access
  skip_after_action :verify_authorized, :verify_policy_scoped
  before_action :set_user_by_token, only: %i[ edit update ]
  rate_limit to: 10, within: 3.minutes, only: :create, with: -> { redirect_to new_password_path }

  def new
  end

  def create
    if user = User.find_by(email_address: params[:email_address])
      PasswordsMailer.reset(user).deliver_later
    end

    AuditLog.record!(
      "password.reset.requested",
      payload: { email_digest: Digest::SHA256.hexdigest(params[:email_address].to_s.downcase) },
      request: request
    )

    redirect_to new_session_path, notice: "ご登録のメールアドレスがあれば、再設定の案内をお送りしました。"
  end

  def edit
  end

  def update
    if @user.update(params.permit(:password, :password_confirmation))
      @user.sessions.destroy_all
      redirect_to new_session_path
    else
      render :edit, status: :unprocessable_entity
    end
  end

  private
    def set_user_by_token
      @user = User.find_by_password_reset_token!(params[:token])
    rescue ActiveSupport::MessageVerifier::InvalidSignature
      redirect_to new_password_path
    end
end
