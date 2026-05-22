# frozen_string_literal: true

# 自分のサブスクは read のみ。作成・更新・削除は Stripe webhook（admin / system 文脈）でのみ行う。
class SubscriptionPolicy < OwnedRecordPolicy
  def create?
    admin?
  end

  def update?
    admin?
  end

  def destroy?
    admin?
  end
end
