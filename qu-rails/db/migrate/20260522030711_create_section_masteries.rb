class CreateSectionMasteries < ActiveRecord::Migration[8.1]
  def change
    create_table :section_masteries do |t|
      t.references :user,    null: false, foreign_key: true
      t.references :section, null: false, foreign_key: true
      t.float      :score,   null: false, default: 0.0

      t.timestamps
    end

    add_index :section_masteries, [ :user_id, :section_id ], unique: true

    add_check_constraint :section_masteries,
      "score >= 0.0 AND score <= 1.0",
      name: "chk_section_masteries_score"
  end
end
