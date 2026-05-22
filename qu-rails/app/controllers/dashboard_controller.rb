# frozen_string_literal: true

class DashboardController < ApplicationController
  def index
    @activity      = Current.user.daily_activities.find_or_create_by!(date: Date.current)
    @certification = Certification.published.find_by(slug: Current.user.preferred_certification)
    @due_count     = 0
    @new_count     = 0

    if @certification
      question_ids = Question.for_certification(@certification).pluck(:id)
      if question_ids.any?
        states     = Current.user.question_review_states.where(question_id: question_ids)
        @due_count = states.due.count
        @new_count = question_ids.size - states.count
      end
    end
  end
end
