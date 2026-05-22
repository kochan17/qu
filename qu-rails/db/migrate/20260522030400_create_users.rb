class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      ## Authentication
      t.string :email_address, null: false
      t.string :password_digest, null: false

      ## Profile
      t.string  :display_name
      t.string  :avatar_url
      t.string  :role,                          null: false, default: "user"
      t.string  :preferred_certification
      t.boolean :calm_mode,                     null: false, default: false
      t.date    :calm_mode_until
      t.date    :paused_until

      ## Notifications settings
      t.boolean :morning_notification_enabled,  null: false, default: true
      t.boolean :evening_notification_enabled,  null: false, default: false

      ## Streak
      t.integer :current_streak,                null: false, default: 0
      t.integer :longest_streak,                null: false, default: 0
      t.date    :last_active_date
      t.integer :streak_freeze_count,           null: false, default: 0

      t.timestamps
    end

    add_index :users, :email_address, unique: true

    add_check_constraint :users, "role IN ('user', 'admin')", name: "chk_users_role"
    add_check_constraint :users,
      "preferred_certification IS NULL OR preferred_certification IN ('ip', 'fe', 'genai', 'gken')",
      name: "chk_users_preferred_certification"
  end
end
