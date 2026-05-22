class CreateQuestions < ActiveRecord::Migration[8.1]
  def change
    create_table :questions do |t|
      t.references :lesson, null: false, foreign_key: true
      t.string  :format,            null: false
      t.text    :question_text,     null: false
      t.jsonb   :choices
      t.string  :correct_choice_id
      t.text    :explanation
      t.string  :status,            null: false, default: "draft"
      t.integer :position,          null: false, default: 0

      t.timestamps
    end

    add_index :questions, :status

    add_check_constraint :questions,
      "format IN ('multiple_choice', 'written', 'cbt')",
      name: "chk_questions_format"
    add_check_constraint :questions,
      "status IN ('draft', 'published')",
      name: "chk_questions_status"
  end
end
