class CreateSubscriptions < ActiveRecord::Migration[8.1]
  def change
    create_table :subscriptions do |t|
      t.references :user, null: false, foreign_key: true
      t.string     :status, null: false
      t.string     :source, null: false, default: "stripe"
      t.string     :stripe_customer_id
      t.string     :stripe_subscription_id
      t.datetime   :current_period_end

      t.timestamps
    end

    add_index :subscriptions, :stripe_subscription_id, unique: true

    add_check_constraint :subscriptions,
      "status IN ('active', 'past_due', 'canceled', 'trialing', 'incomplete')",
      name: "chk_subscriptions_status"
    add_check_constraint :subscriptions,
      "source IN ('stripe', 'apple_iap', 'google_iap')",
      name: "chk_subscriptions_source"
  end
end
