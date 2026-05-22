class CreateLessons < ActiveRecord::Migration[8.1]
  def change
    create_table :lessons do |t|
      t.references :section, null: false, foreign_key: true
      t.string  :title,            null: false
      t.string  :slug,             null: false
      t.string  :content_type,     null: false
      t.text    :body
      t.text    :intro
      t.text    :why_matters
      t.integer :duration_seconds
      t.boolean :is_published,     null: false, default: false
      t.integer :position,         null: false, default: 0

      t.timestamps
    end

    add_index :lessons, [ :section_id, :slug ], unique: true

    add_check_constraint :lessons,
      "content_type IN ('video', 'text', 'audio', 'quiz')",
      name: "chk_lessons_content_type"
    add_check_constraint :lessons,
      "intro IS NULL OR char_length(intro) <= 200",
      name: "chk_lessons_intro_length"
    add_check_constraint :lessons,
      "why_matters IS NULL OR char_length(why_matters) <= 200",
      name: "chk_lessons_why_matters_length"
  end
end
