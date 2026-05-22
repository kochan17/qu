class ApplicationController < ActionController::Base
  include Authentication
  include Pundit::Authorization

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  private

  def pundit_user
    Current.user
  end

  def user_not_authorized
    redirect_back fallback_location: root_path, alert: "この操作は許可されていません。"
  end
end
