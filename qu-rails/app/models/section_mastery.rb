class SectionMastery < ApplicationRecord
  belongs_to :user
  belongs_to :section

  validates :section_id, uniqueness: { scope: :user_id }
  validates :score, presence: true,
                    numericality: { greater_than_or_equal_to: 0.0, less_than_or_equal_to: 1.0 }
end
