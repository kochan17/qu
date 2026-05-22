class DailyActivity < ApplicationRecord
  belongs_to :user

  validates :date,         presence: true
  validates :date,         uniqueness: { scope: :user_id }
  validates :recall_count, numericality: { greater_than_or_equal_to: 0 }
  validates :learn_count,  numericality: { greater_than_or_equal_to: 0 }
  validates :audio_count,  numericality: { greater_than_or_equal_to: 0 }
  validates :recall_goal,  numericality: { greater_than: 0 }
  validates :learn_goal,   numericality: { greater_than: 0 }
  validates :audio_goal,   numericality: { greater_than: 0 }

  def increment_audio_count!
    increment!(:audio_count)
  end
end
