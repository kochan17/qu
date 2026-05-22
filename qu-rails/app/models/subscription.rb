class Subscription < ApplicationRecord
  belongs_to :user

  enum :status, {
    active:     "active",
    past_due:   "past_due",
    canceled:   "canceled",
    trialing:   "trialing",
    incomplete: "incomplete"
  }, validate: true

  enum :source, {
    stripe:     "stripe",
    apple_iap:  "apple_iap",
    google_iap: "google_iap"
  }, validate: true

  validates :status, presence: true
  validates :source, presence: true
end
