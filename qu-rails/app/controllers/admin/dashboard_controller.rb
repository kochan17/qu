# frozen_string_literal: true

module Admin
  class DashboardController < BaseController
    def index
      @certifications = Certification.ordered
      @counts = {
        certifications: Certification.count,
        courses:        Course.count,
        sections:       Section.count,
        lessons:        Lesson.count,
        questions:      Question.count
      }
    end
  end
end
