# frozen_string_literal: true

class DashboardController < ApplicationController
  skip_after_action :verify_policy_scoped, only: :index

  def index
    authorize :dashboard, :index?
    @activity      = Current.user.today_activity
    @certification = Certification.published.find_by(slug: Current.user.preferred_certification)
    @queue         = PracticeQueue.new(Current.user).counts
  end
end
