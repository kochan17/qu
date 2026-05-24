class Certification < ApplicationRecord
  include Publishable

  has_many :courses, dependent: :destroy

  enum :category, { it: "it", business: "business" }, validate: true

  validates :slug,     presence: true, uniqueness: true,
                       inclusion: { in: %w[ip fe genai gken] }
  validates :name,     presence: true
  validates :category, presence: true
  validates :position, numericality: { greater_than_or_equal_to: 0 }
end
