class CreateSections < ActiveRecord::Migration[8.1]
  def change
    create_table :sections do |t|
      t.references :course, null: false, foreign_key: true
      t.string  :title,        null: false
      t.boolean :is_published, null: false, default: false
      t.integer :position,     null: false, default: 0

      t.timestamps
    end
  end
end
