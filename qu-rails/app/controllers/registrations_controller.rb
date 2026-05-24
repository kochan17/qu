class RegistrationsController < ApplicationController
  allow_unauthenticated_access only: %i[ new create ]
  skip_after_action :verify_authorized, :verify_policy_scoped
  rate_limit to: 5, within: 1.hour, only: :create,
             with: -> { redirect_to new_registration_path, alert: "登録の試行回数が多すぎます。しばらく時間を置いて再度お試しください。" }

  def new
    @user = User.new
  end

  def create
    @user = User.new(registration_params)
    if @user.save
      start_new_session_for @user
      redirect_to after_authentication_url
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def registration_params
    params.expect(user: [ :email_address, :password, :password_confirmation, :display_name ])
  end
end
