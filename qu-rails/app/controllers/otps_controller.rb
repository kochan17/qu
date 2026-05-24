# frozen_string_literal: true

class OtpsController < ApplicationController
  skip_after_action :verify_authorized, :verify_policy_scoped

  before_action :prepare_otp_setup, only: %i[new create]

  def new
  end

  def create
    codes = Current.user.confirm_otp!(params[:code].to_s.strip)
    if codes
      session.delete(:otp_setup_required)
      AuditLog.record!("otp.enabled", user: Current.user, request: request)
      @backup_codes = codes
      render :backup_codes
    else
      flash.now[:alert] = "コードが正しくありません。認証アプリの表示を確認してもう一度お試しください。"
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    if Current.user.admin?
      redirect_to settings_path, alert: "管理者は二要素認証を無効化できません。"
      return
    end

    unless Current.user.verify_otp(params[:code].to_s.strip)
      redirect_to settings_path, alert: "コードが正しくありません。もう一度お試しください。"
      return
    end

    Current.user.disable_otp!
    AuditLog.record!("otp.disabled", user: Current.user, request: request)
    redirect_to settings_path, notice: "二要素認証を無効化しました。"
  end

  private

  def prepare_otp_setup
    Current.user.ensure_otp_secret!
    @otp_secret       = Current.user.otp_secret
    @provisioning_uri = Current.user.otp_provisioning_uri
    @qr_svg           = RQRCode::QRCode.new(@provisioning_uri).as_svg(viewbox: true, standalone: true)
  end
end
