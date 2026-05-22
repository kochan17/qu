# frozen_string_literal: true

class SettingsController < ApplicationController
  def show
    @user           = Current.user
    @certifications = Certification.published.ordered
  end

  def update
    @user = Current.user
    if @user.update(settings_params)
      redirect_to settings_path, notice: "設定を保存しました。"
    else
      @certifications = Certification.published.ordered
      render :show, status: :unprocessable_entity
    end
  end

  private

  def settings_params
    params.expect(user: [
      :display_name,
      :preferred_certification,
      :morning_notification_enabled,
      :evening_notification_enabled,
      :calm_mode
    ])
  end
end
