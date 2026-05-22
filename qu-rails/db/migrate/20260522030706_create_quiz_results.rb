class CreateQuizResults < ActiveRecord::Migration[8.1]
  def change
    create_table :quiz_results do |t|
      t.references :user,     null: false, foreign_key: true
      t.references :question, null: false, foreign_key: true
      t.string     :selected_choice_id
      t.boolean    :is_correct,  null: false
      t.datetime   :answered_at, null: false, default: -> { "now()" }

      t.timestamps
    end

    add_index :quiz_results, [ :user_id, :answered_at ], order: { answered_at: :desc }
  end
end
