# frozen_string_literal: true

# 攻撃者やスキャナが典型的に叩く餌のエンドポイント。叩かれたら audit_logs に記録する。
# 404 を返してそれ以上の調査を促さない。
class HoneypotsController < ApplicationController
  allow_unauthenticated_access
  skip_after_action :verify_authorized, :verify_policy_scoped

  def trip
    AuditLog.record!("honeypot.tripped", request: request, payload: {
      path: request.path,
      method: request.method,
      referer: request.referer
    })
    head :not_found
  end
end
