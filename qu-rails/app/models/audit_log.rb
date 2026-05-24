# frozen_string_literal: true

# 監査ログ。改ざん追跡・不審アクセス検出のため、認証イベントと管理操作を追記する。
# append-only で扱う想定（update / destroy はしない）。
class AuditLog < ApplicationRecord
  belongs_to :user, optional: true

  validates :action, presence: true

  # 失敗時に通常リクエストを止めたくないので rescue + warn に留める。
  def self.record!(action, user: nil, resource: nil, payload: {}, request: nil)
    create!(
      action: action.to_s,
      user_id: user&.id,
      resource_type: resource&.class&.name,
      resource_id: resource&.id,
      payload: payload,
      ip_address: request&.remote_ip,
      user_agent: request&.user_agent
    )
  rescue StandardError => e
    Rails.logger.warn("AuditLog.record! failed: #{e.message}")
  end
end
