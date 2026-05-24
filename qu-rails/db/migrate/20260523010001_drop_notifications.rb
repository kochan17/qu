# notifications テーブルは生成・表示のどちらも実装が無く未使用のため削除する。
# 通知設定のトグルは users.morning/evening_notification_enabled 側で保持している。
class DropNotifications < ActiveRecord::Migration[8.1]
  def change
    drop_table :notifications do |t|
      t.text :body
      t.datetime :created_at, null: false
      t.string :kind, null: false
      t.string :link
      t.datetime :read_at
      t.string :title, null: false
      t.datetime :updated_at, null: false
      t.bigint :user_id, null: false
      t.index [ :user_id, :created_at ]
      t.index [ :user_id ]
    end
  end
end
