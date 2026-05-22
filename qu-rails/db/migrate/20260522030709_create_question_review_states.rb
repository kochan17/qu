class CreateQuestionReviewStates < ActiveRecord::Migration[8.1]
  def change
    create_table :question_review_states do |t|
      t.references :user,     null: false, foreign_key: true
      t.references :question, null: false, foreign_key: true
      t.float      :stability,       default: 0.0
      t.float      :difficulty,      default: 0.0
      t.datetime   :due_at,          null: false, default: -> { "now()" }
      t.datetime   :last_reviewed_at
      t.integer    :reps,            default: 0
      t.integer    :lapses,          default: 0

      t.timestamps
    end

    add_index :question_review_states, [ :user_id, :question_id ], unique: true
    add_index :question_review_states, [ :user_id, :due_at ]
  end
end
