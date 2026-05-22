class CreateDailyActivities < ActiveRecord::Migration[8.1]
  def change
    create_table :daily_activities do |t|
      t.references :user, null: false, foreign_key: true
      t.date    :date,         null: false
      t.integer :recall_count, null: false, default: 0
      t.integer :learn_count,  null: false, default: 0
      t.integer :audio_count,  null: false, default: 0
      t.integer :recall_goal,  null: false, default: 3
      t.integer :learn_goal,   null: false, default: 7
      t.integer :audio_goal,   null: false, default: 1

      t.timestamps
    end

    add_index :daily_activities, [ :user_id, :date ], unique: true

    # Generated stored column: completed = all goals met
    reversible do |dir|
      dir.up do
        execute <<~SQL
          ALTER TABLE daily_activities
            ADD COLUMN completed boolean
              GENERATED ALWAYS AS (
                (recall_count + learn_count) >= (recall_goal + learn_goal)
                AND audio_count >= audio_goal
              ) STORED;
        SQL
      end
      dir.down do
        execute "ALTER TABLE daily_activities DROP COLUMN completed;"
      end
    end
  end
end
