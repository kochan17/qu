# frozen_string_literal: true

class OnboardingController < ApplicationController
  # require_authentication は ApplicationController（Authentication concern）で
  # 既定有効。資格未選択でも require_onboarding はこのコントローラを除外する。
  def show
    @certifications = Certification.published.ordered

    if params[:certification].present?
      @selected = @certifications.find_by(slug: params[:certification])
      if @selected
        @preview_question = Question.for_certification(@selected).in_content_order.first
      end
    end
  end

  def update
    slug = params[:certification].to_s
    if Certification.published.exists?(slug: slug)
      Current.user.update!(preferred_certification: slug)
      redirect_to root_path, notice: "ようこそ。学習の準備ができました。"
    else
      redirect_to onboarding_path, alert: "資格を選んでください。"
    end
  end
end
