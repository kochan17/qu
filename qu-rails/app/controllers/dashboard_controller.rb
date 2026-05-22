# frozen_string_literal: true

class DashboardController < ApplicationController
  def index
    @daily_activity = find_or_create_today_activity
    @streak         = Current.user.current_streak
    @today_questions = fetch_today_questions
  end

  private

  def find_or_create_today_activity
    Current.user.daily_activities.find_or_create_by!(date: Date.current)
  end

  # preferred_certification 配下の published 問題を最大 10 件取得。
  # FSRS による出題選定は B3 で実装するため、ここでは position 順の簡易抽出。
  def fetch_today_questions
    cert_slug = Current.user.preferred_certification
    return Question.none if cert_slug.blank?

    certification = Certification.published.find_by(slug: cert_slug)
    return Question.none if certification.nil?

    Question
      .joins(lesson: { section: :course })
      .where(courses: { certification_id: certification.id, is_published: true })
      .where(lessons: { is_published: true })
      .where(sections: { is_published: true })
      .published
      .order("questions.position")
      .limit(10)
  end
end
