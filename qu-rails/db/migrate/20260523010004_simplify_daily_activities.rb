# Daily Ring は復習・新規の正答数のみで達成判定する。音声機能は廃止のため
# audio 列を削除し、生成列 completed を audio 抜きで定義し直す。
class SimplifyDailyActivities < ActiveRecord::Migration[8.1]
  def up
    remove_column :daily_activities, :completed
    remove_column :daily_activities, :audio_count
    remove_column :daily_activities, :audio_goal
    execute <<~SQL
      ALTER TABLE daily_activities
      ADD COLUMN completed boolean
      GENERATED ALWAYS AS ((recall_count + learn_count) >= (recall_goal + learn_goal)) STORED
    SQL
  end

  def down
    remove_column :daily_activities, :completed
    add_column :daily_activities, :audio_count, :integer, default: 0, null: false
    add_column :daily_activities, :audio_goal, :integer, default: 1, null: false
    execute <<~SQL
      ALTER TABLE daily_activities
      ADD COLUMN completed boolean
      GENERATED ALWAYS AS (
        ((recall_count + learn_count) >= (recall_goal + learn_goal))
        AND (audio_count >= audio_goal)
      ) STORED
    SQL
  end
end
