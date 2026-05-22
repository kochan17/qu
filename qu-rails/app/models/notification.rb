class Notification < ApplicationRecord
  belongs_to :user

  enum :kind, {
    streak:       "streak",
    reminder:     "reminder",
    system:       "system",
    subscription: "subscription"
  }, validate: true

  validates :kind,  presence: true
  validates :title, presence: true

  scope :unread,   -> { where(read_at: nil) }
  scope :recent,   -> { order(created_at: :desc) }
end
