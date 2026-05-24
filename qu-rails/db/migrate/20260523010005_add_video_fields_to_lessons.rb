# 動画レッスン用: HyperFrames コンポジションのソースと、動画の状態を保持する。
# video は Active Storage 添付（lessons には専用カラム不要）。
class AddVideoFieldsToLessons < ActiveRecord::Migration[8.1]
  def change
    add_column :lessons, :hyperframes_source, :text
    add_column :lessons, :video_status, :string, default: "none", null: false

    add_check_constraint :lessons,
      "video_status::text = ANY (ARRAY['none'::varchar, 'uploaded'::varchar, 'rendering'::varchar, 'ready'::varchar, 'failed'::varchar]::text[])",
      name: "chk_lessons_video_status"
  end
end
