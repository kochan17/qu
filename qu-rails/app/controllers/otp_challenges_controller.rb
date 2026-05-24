# frozen_string_literal: true

# OTP チャレンジ画面。パスワード認証済みで otp_pending 状態のユーザーが TOTP コードを入力する。
# セッションは既に確立済みだが、otp_pending フラグが立っている間は他のページへ進めない。
class OtpChallengesController < ApplicationController
  # セッション（Cookie）は有効な状態で到達するので require_authentication は通過する。
  # enforce_otp_step のリダイレクトループを防ぐため、このコントローラは除外対象にする。
  skip_after_action :verify_authorized, :verify_policy_scoped

  def new
    redirect_to root_path unless session[:otp_pending_user_id]
  end

  def create
    user = User.find_by(id: session[:otp_pending_user_id])
    unless user
      redirect_to new_session_path
      return
    end

    if user.verify_otp(params[:code].to_s.strip)
      session.delete(:otp_pending)
      session.delete(:otp_pending_user_id)
      AuditLog.record!("otp.challenge.success", user: user, request: request)
      redirect_to after_authentication_url
    else
      AuditLog.record!("otp.challenge.failed", user: user, request: request)
      flash.now[:alert] = "コードが正しくありません。認証アプリまたはバックアップコードを確認してください。"
      render :new, status: :unprocessable_entity
    end
  end
end
