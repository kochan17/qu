# frozen_string_literal: true

module Admin
  # 管理画面の基底コントローラ。admin ロール以外のアクセスを弾く。
  # 認可は require_admin で行うため Pundit の verify は不要。
  class BaseController < ApplicationController
    layout "admin"
    before_action :require_admin
    skip_after_action :verify_authorized, :verify_policy_scoped

    private

    def require_admin
      return if Current.user&.admin?

      redirect_to root_path, alert: "管理者の権限が必要です。"
    end
  end
end
