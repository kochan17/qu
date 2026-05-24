module Publishable
  extend ActiveSupport::Concern

  included do
    scope :published, -> { where(is_published: true) }
    scope :ordered,   -> { order(:position) }
  end

  def published? = is_published?
end
