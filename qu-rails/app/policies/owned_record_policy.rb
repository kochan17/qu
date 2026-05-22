# frozen_string_literal: true

# 自分のデータのみアクセス可能なレコード用の基底ポリシー。
# admin は全レコードにアクセス可。Supabase RLS「自分のデータのみ」の置き換え。
class OwnedRecordPolicy < ApplicationPolicy
  def index?
    user.present?
  end

  def show?
    owner? || admin?
  end

  def create?
    user.present?
  end

  def update?
    owner? || admin?
  end

  def destroy?
    owner? || admin?
  end

  private

  def owner?
    user.present? && record.respond_to?(:user_id) && record.user_id == user.id
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      return scope.none if user.blank?
      return scope.all if user.admin?

      scope.where(user_id: user.id)
    end
  end
end
