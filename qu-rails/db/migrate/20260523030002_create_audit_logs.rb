# 改ざん追跡・不審アクセス検出のための監査ログ。append-only で扱う。
# 失敗ログイン・ハニーポット踏抜き・content:import 等のドメイン操作を記録する。
class CreateAuditLogs < ActiveRecord::Migration[8.1]
  def change
    create_table :audit_logs do |t|
      t.references :user, foreign_key: true, null: true
      t.string :action, null: false
      t.string :resource_type
      t.bigint :resource_id
      t.jsonb :payload, default: {}, null: false
      t.string :ip_address
      t.string :user_agent
      t.datetime :created_at, null: false
    end

    add_index :audit_logs, [ :action, :created_at ]
    add_index :audit_logs, [ :resource_type, :resource_id ]
  end
end
