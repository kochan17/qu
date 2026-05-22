class CreateCourses < ActiveRecord::Migration[8.1]
  def change
    create_table :courses do |t|
      t.references :certification, null: false, foreign_key: true
      t.string  :title,         null: false
      t.text    :description
      t.string  :thumbnail_url
      t.boolean :is_published, null: false, default: false
      t.integer :position,      null: false, default: 0

      t.timestamps
    end
  end
end
