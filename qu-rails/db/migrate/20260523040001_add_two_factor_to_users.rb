# TOTP ベースの 2 要素認証。admin は必須、一般ユーザーは任意で有効化できる。
class AddTwoFactorToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :otp_secret, :string
    add_column :users, :otp_enabled, :boolean, default: false, null: false
    add_column :users, :otp_backup_codes_digests, :jsonb, default: [], null: false
  end
end
