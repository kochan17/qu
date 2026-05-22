class CreateCertifications < ActiveRecord::Migration[8.1]
  def change
    create_table :certifications do |t|
      t.string  :slug,         null: false
      t.string  :name,         null: false
      t.text    :description
      t.string  :category,     null: false
      t.boolean :is_published, null: false, default: false
      t.integer :position,     null: false, default: 0

      t.timestamps
    end

    add_index :certifications, :slug, unique: true

    add_check_constraint :certifications,
      "slug IN ('ip', 'fe', 'genai', 'gken')",
      name: "chk_certifications_slug"
    add_check_constraint :certifications,
      "category IN ('it', 'business')",
      name: "chk_certifications_category"
  end
end
