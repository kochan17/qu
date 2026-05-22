class ApplicationController < ActionController::Base
  include Authentication
  include Pundit::Authorization

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  # 資格未選択のユーザーはオンボーディングへ誘導する。
  before_action :require_onboarding

  private

  def pundit_user
    Current.user
  end

  # ログイン済みで preferred_certification 未設定なら資格選択へ。
  # onboarding コントローラ自身は対象外（無限リダイレクト防止）。
  def require_onboarding
    return unless authenticated?
    return if controller_name == "onboarding"
    return if Current.user.onboarded?

    redirect_to onboarding_path
  end

  def user_not_authorized
    redirect_back fallback_location: root_path, alert: "この操作は許可されていません。"
  end
end
