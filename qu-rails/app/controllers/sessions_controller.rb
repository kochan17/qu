class SessionsController < ApplicationController
  allow_unauthenticated_access only: %i[ new create ]
  skip_after_action :verify_authorized, :verify_policy_scoped
  rate_limit to: 10, within: 3.minutes, only: :create,
             with: -> { redirect_to new_session_path, alert: "試行回数が多すぎます。しばらく時間を置いて再度お試しください。" }

  def new
    @login_form = LoginForm.new
  end

  def create
    @login_form = LoginForm.new(login_params)
    user = User.find_by(email_address: @login_form.email_address.to_s.strip.downcase)

    if user&.locked?
      @login_form.errors.add(:base,
        "アカウントが一時的にロックされています。しばらく時間を置いてからお試しください。")
      AuditLog.record!("login.locked", user: user, request: request)
      render :new, status: :unprocessable_entity and return
    end

    if @login_form.valid?
      user = @login_form.user
      user.register_successful_login!
      start_new_session_for user
      AuditLog.record!("login.success", user: user, request: request)

      if user.otp_enabled?
        session[:otp_pending]         = true
        session[:otp_pending_user_id] = user.id
        redirect_to new_otp_challenge_path
      elsif user.admin? && !user.otp_enabled?
        session[:otp_setup_required] = true
        redirect_to new_otp_path, notice: "管理者は二要素認証の設定が必要です。"
      else
        redirect_to after_authentication_url
      end
    else
      user&.register_failed_login!
      AuditLog.record!("login.failed", user: user, request: request,
        payload: { email: @login_form.email_address.to_s })
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    user = Current.user
    terminate_session
    AuditLog.record!("logout", user: user, request: request)
    redirect_to new_session_path, status: :see_other
  end

  private

  def login_params
    params.fetch(:login_form, params).permit(:email_address, :password)
  end
end
