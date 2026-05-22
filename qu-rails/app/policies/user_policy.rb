# frozen_string_literal: true

class UserPolicy < ApplicationPolicy
  def show?
    own_account? || admin?
  end

  def update?
    own_account? || admin?
  end

  def destroy?
    admin?
  end

  private

  def own_account?
    user.present? && record == user
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      return scope.none if user.blank?
      return scope.all if user.admin?

      scope.where(id: user.id)
    end
  end
end
