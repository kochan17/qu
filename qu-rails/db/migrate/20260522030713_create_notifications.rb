class CreateNotifications < ActiveRecord::Migration[8.1]
  def change
    create_table :notifications do |t|
      t.references :user, null: false, foreign_key: true
      t.string     :kind,  null: false
      t.string     :title, null: false
      t.text       :body
      t.string     :link
      t.datetime   :read_at

      t.timestamps
    end

    add_index :notifications, [ :user_id, :created_at ]

    add_check_constraint :notifications,
      "kind IN ('streak', 'reminder', 'system', 'subscription')",
      name: "chk_notifications_kind"
  end
end
