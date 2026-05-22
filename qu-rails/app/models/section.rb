class Section < ApplicationRecord
  belongs_to :course
  has_many :lessons,          dependent: :destroy
  has_many :section_masteries, dependent: :destroy

  validates :title,    presence: true
  validates :position, numericality: { greater_than_or_equal_to: 0 }

  scope :published, -> { where(is_published: true) }
  scope :ordered,   -> { order(:position) }

  def published?
    is_published?
  end
end
