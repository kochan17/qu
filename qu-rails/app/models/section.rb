class Section < ApplicationRecord
  include Publishable

  belongs_to :course
  has_many :lessons, dependent: :destroy

  validates :title,    presence: true
  validates :position, numericality: { greater_than_or_equal_to: 0 }
end
