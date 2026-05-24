# section_masteries は習熟度ゲートの予定テーブルだが UI・コントローラに実装が無く未使用。
# 進捗はレッスン完了数で表現しているため削除する。
class DropSectionMasteries < ActiveRecord::Migration[8.1]
  def change
    drop_table :section_masteries do |t|
      t.datetime :created_at, null: false
      t.float :score, default: 0.0, null: false
      t.bigint :section_id, null: false
      t.datetime :updated_at, null: false
      t.bigint :user_id, null: false
      t.index [ :section_id ]
      t.index [ :user_id, :section_id ], unique: true
      t.index [ :user_id ]
    end
  end
end
