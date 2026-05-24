# frozen_string_literal: true

class PracticePolicy < ApplicationPolicy
  def show?
    user.present?
  end
end
