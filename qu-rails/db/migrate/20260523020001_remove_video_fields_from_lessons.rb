# 動画生成はファイル駆動（HyperFrames は content/ 側で render し、import で MP4 添付）に
# 切り替えたため、DB 側のソース格納とステータスは不要になった。
class RemoveVideoFieldsFromLessons < ActiveRecord::Migration[8.1]
  def up
    remove_check_constraint :lessons, name: "chk_lessons_video_status"
    remove_column :lessons, :hyperframes_source
    remove_column :lessons, :video_status
  end

  def down
    add_column :lessons, :hyperframes_source, :text
    add_column :lessons, :video_status, :string, default: "none", null: false
    add_check_constraint :lessons,
      "video_status::text = ANY (ARRAY['none'::varchar, 'uploaded'::varchar, 'rendering'::varchar, 'ready'::varchar, 'failed'::varchar]::text[])",
      name: "chk_lessons_video_status"
  end
end
