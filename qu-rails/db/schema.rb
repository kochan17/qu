# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_05_23_040001) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "audit_logs", force: :cascade do |t|
    t.string "action", null: false
    t.datetime "created_at", null: false
    t.string "ip_address"
    t.jsonb "payload", default: {}, null: false
    t.bigint "resource_id"
    t.string "resource_type"
    t.string "user_agent"
    t.bigint "user_id"
    t.index ["action", "created_at"], name: "index_audit_logs_on_action_and_created_at"
    t.index ["resource_type", "resource_id"], name: "index_audit_logs_on_resource_type_and_resource_id"
    t.index ["user_id"], name: "index_audit_logs_on_user_id"
  end

  create_table "certifications", force: :cascade do |t|
    t.string "category", null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.boolean "is_published", default: false, null: false
    t.string "name", null: false
    t.integer "position", default: 0, null: false
    t.string "slug", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_certifications_on_slug", unique: true
    t.check_constraint "category::text = ANY (ARRAY['it'::character varying, 'business'::character varying]::text[])", name: "chk_certifications_category"
    t.check_constraint "slug::text = ANY (ARRAY['ip'::character varying, 'fe'::character varying, 'genai'::character varying, 'gken'::character varying]::text[])", name: "chk_certifications_slug"
  end

  create_table "courses", force: :cascade do |t|
    t.bigint "certification_id", null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.boolean "is_published", default: false, null: false
    t.integer "position", default: 0, null: false
    t.string "thumbnail_url"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["certification_id"], name: "index_courses_on_certification_id"
  end

  create_table "daily_activities", force: :cascade do |t|
    t.virtual "completed", type: :boolean, as: "((recall_count + learn_count) >= (recall_goal + learn_goal))", stored: true
    t.datetime "created_at", null: false
    t.date "date", null: false
    t.integer "learn_count", default: 0, null: false
    t.integer "learn_goal", default: 7, null: false
    t.integer "recall_count", default: 0, null: false
    t.integer "recall_goal", default: 3, null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id", "date"], name: "index_daily_activities_on_user_id_and_date", unique: true
    t.index ["user_id"], name: "index_daily_activities_on_user_id"
  end

  create_table "lesson_completions", force: :cascade do |t|
    t.datetime "completed_at", default: -> { "now()" }, null: false
    t.datetime "created_at", null: false
    t.bigint "lesson_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["lesson_id"], name: "index_lesson_completions_on_lesson_id"
    t.index ["user_id", "lesson_id"], name: "index_lesson_completions_on_user_id_and_lesson_id", unique: true
    t.index ["user_id"], name: "index_lesson_completions_on_user_id"
  end

  create_table "lessons", force: :cascade do |t|
    t.text "body"
    t.string "content_type", null: false
    t.datetime "created_at", null: false
    t.integer "duration_seconds"
    t.text "intro"
    t.boolean "is_published", default: false, null: false
    t.integer "position", default: 0, null: false
    t.bigint "section_id", null: false
    t.string "slug", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.text "why_matters"
    t.index ["section_id", "slug"], name: "index_lessons_on_section_id_and_slug", unique: true
    t.index ["section_id"], name: "index_lessons_on_section_id"
    t.check_constraint "content_type::text = ANY (ARRAY['video'::character varying, 'text'::character varying, 'audio'::character varying, 'quiz'::character varying]::text[])", name: "chk_lessons_content_type"
    t.check_constraint "intro IS NULL OR char_length(intro) <= 200", name: "chk_lessons_intro_length"
    t.check_constraint "why_matters IS NULL OR char_length(why_matters) <= 200", name: "chk_lessons_why_matters_length"
  end

  create_table "question_review_states", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.float "difficulty", default: 0.0
    t.datetime "due_at", default: -> { "now()" }, null: false
    t.integer "lapses", default: 0
    t.datetime "last_reviewed_at"
    t.bigint "question_id", null: false
    t.integer "reps", default: 0
    t.float "stability", default: 0.0
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["question_id"], name: "index_question_review_states_on_question_id"
    t.index ["user_id", "due_at"], name: "index_question_review_states_on_user_id_and_due_at"
    t.index ["user_id", "question_id"], name: "index_question_review_states_on_user_id_and_question_id", unique: true
    t.index ["user_id"], name: "index_question_review_states_on_user_id"
  end

  create_table "questions", force: :cascade do |t|
    t.jsonb "choices"
    t.string "correct_choice_id"
    t.datetime "created_at", null: false
    t.text "explanation"
    t.string "format", null: false
    t.bigint "lesson_id", null: false
    t.integer "position", default: 0, null: false
    t.text "question_text", null: false
    t.string "status", default: "draft", null: false
    t.datetime "updated_at", null: false
    t.index ["lesson_id"], name: "index_questions_on_lesson_id"
    t.index ["status"], name: "index_questions_on_status"
    t.check_constraint "format::text = ANY (ARRAY['multiple_choice'::character varying, 'written'::character varying, 'cbt'::character varying]::text[])", name: "chk_questions_format"
    t.check_constraint "status::text = ANY (ARRAY['draft'::character varying, 'published'::character varying]::text[])", name: "chk_questions_status"
  end

  create_table "quiz_results", force: :cascade do |t|
    t.datetime "answered_at", default: -> { "now()" }, null: false
    t.datetime "created_at", null: false
    t.boolean "is_correct", null: false
    t.bigint "question_id", null: false
    t.string "selected_choice_id"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["question_id"], name: "index_quiz_results_on_question_id"
    t.index ["user_id", "answered_at"], name: "index_quiz_results_on_user_id_and_answered_at", order: { answered_at: :desc }
    t.index ["user_id"], name: "index_quiz_results_on_user_id"
  end

  create_table "sections", force: :cascade do |t|
    t.bigint "course_id", null: false
    t.datetime "created_at", null: false
    t.boolean "is_published", default: false, null: false
    t.integer "position", default: 0, null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["course_id"], name: "index_sections_on_course_id"
  end

  create_table "sessions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "ip_address"
    t.datetime "updated_at", null: false
    t.string "user_agent"
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "solid_cable_messages", force: :cascade do |t|
    t.binary "channel", null: false
    t.bigint "channel_hash", null: false
    t.datetime "created_at", null: false
    t.binary "payload", null: false
    t.index ["channel"], name: "index_solid_cable_messages_on_channel"
    t.index ["channel_hash"], name: "index_solid_cable_messages_on_channel_hash"
    t.index ["created_at"], name: "index_solid_cable_messages_on_created_at"
  end

  create_table "solid_cache_entries", force: :cascade do |t|
    t.integer "byte_size", null: false
    t.datetime "created_at", null: false
    t.binary "key", null: false
    t.bigint "key_hash", null: false
    t.binary "value", null: false
    t.index ["byte_size"], name: "index_solid_cache_entries_on_byte_size"
    t.index ["key_hash", "byte_size"], name: "index_solid_cache_entries_on_key_hash_and_byte_size"
    t.index ["key_hash"], name: "index_solid_cache_entries_on_key_hash", unique: true
  end

  create_table "solid_queue_blocked_executions", force: :cascade do |t|
    t.string "concurrency_key", null: false
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.bigint "job_id", null: false
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.index ["concurrency_key", "priority", "job_id"], name: "index_solid_queue_blocked_executions_for_release"
    t.index ["expires_at", "concurrency_key"], name: "index_solid_queue_blocked_executions_for_maintenance"
    t.index ["job_id"], name: "index_solid_queue_blocked_executions_on_job_id", unique: true
  end

  create_table "solid_queue_claimed_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.bigint "process_id"
    t.index ["job_id"], name: "index_solid_queue_claimed_executions_on_job_id", unique: true
    t.index ["process_id", "job_id"], name: "index_solid_queue_claimed_executions_on_process_id_and_job_id"
  end

  create_table "solid_queue_failed_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "error"
    t.bigint "job_id", null: false
    t.index ["job_id"], name: "index_solid_queue_failed_executions_on_job_id", unique: true
  end

  create_table "solid_queue_jobs", force: :cascade do |t|
    t.string "active_job_id"
    t.text "arguments"
    t.string "class_name", null: false
    t.string "concurrency_key"
    t.datetime "created_at", null: false
    t.datetime "finished_at"
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.datetime "scheduled_at"
    t.datetime "updated_at", null: false
    t.index ["active_job_id"], name: "index_solid_queue_jobs_on_active_job_id"
    t.index ["class_name"], name: "index_solid_queue_jobs_on_class_name"
    t.index ["finished_at"], name: "index_solid_queue_jobs_on_finished_at"
    t.index ["queue_name", "finished_at"], name: "index_solid_queue_jobs_for_filtering"
    t.index ["scheduled_at", "finished_at"], name: "index_solid_queue_jobs_for_alerting"
  end

  create_table "solid_queue_pauses", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "queue_name", null: false
    t.index ["queue_name"], name: "index_solid_queue_pauses_on_queue_name", unique: true
  end

  create_table "solid_queue_processes", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "hostname"
    t.string "kind", null: false
    t.datetime "last_heartbeat_at", null: false
    t.text "metadata"
    t.string "name", null: false
    t.integer "pid", null: false
    t.bigint "supervisor_id"
    t.index ["last_heartbeat_at"], name: "index_solid_queue_processes_on_last_heartbeat_at"
    t.index ["name", "supervisor_id"], name: "index_solid_queue_processes_on_name_and_supervisor_id", unique: true
    t.index ["supervisor_id"], name: "index_solid_queue_processes_on_supervisor_id"
  end

  create_table "solid_queue_ready_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.index ["job_id"], name: "index_solid_queue_ready_executions_on_job_id", unique: true
    t.index ["priority", "job_id"], name: "index_solid_queue_poll_all"
    t.index ["queue_name", "priority", "job_id"], name: "index_solid_queue_poll_by_queue"
  end

  create_table "solid_queue_recurring_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.datetime "run_at", null: false
    t.string "task_key", null: false
    t.index ["job_id"], name: "index_solid_queue_recurring_executions_on_job_id", unique: true
    t.index ["task_key", "run_at"], name: "index_solid_queue_recurring_executions_on_task_key_and_run_at", unique: true
  end

  create_table "solid_queue_recurring_tasks", force: :cascade do |t|
    t.text "arguments"
    t.string "class_name"
    t.string "command", limit: 2048
    t.datetime "created_at", null: false
    t.text "description"
    t.string "key", null: false
    t.integer "priority", default: 0
    t.string "queue_name"
    t.string "schedule", null: false
    t.boolean "static", default: true, null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_solid_queue_recurring_tasks_on_key", unique: true
    t.index ["static"], name: "index_solid_queue_recurring_tasks_on_static"
  end

  create_table "solid_queue_scheduled_executions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "job_id", null: false
    t.integer "priority", default: 0, null: false
    t.string "queue_name", null: false
    t.datetime "scheduled_at", null: false
    t.index ["job_id"], name: "index_solid_queue_scheduled_executions_on_job_id", unique: true
    t.index ["scheduled_at", "priority", "job_id"], name: "index_solid_queue_dispatch_all"
  end

  create_table "solid_queue_semaphores", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.string "key", null: false
    t.datetime "updated_at", null: false
    t.integer "value", default: 1, null: false
    t.index ["expires_at"], name: "index_solid_queue_semaphores_on_expires_at"
    t.index ["key", "value"], name: "index_solid_queue_semaphores_on_key_and_value"
    t.index ["key"], name: "index_solid_queue_semaphores_on_key", unique: true
  end

  create_table "subscriptions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "current_period_end"
    t.string "source", default: "stripe", null: false
    t.string "status", null: false
    t.string "stripe_customer_id"
    t.string "stripe_subscription_id"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["stripe_subscription_id"], name: "index_subscriptions_on_stripe_subscription_id", unique: true
    t.index ["user_id"], name: "index_subscriptions_on_user_id"
    t.check_constraint "source::text = ANY (ARRAY['stripe'::character varying, 'apple_iap'::character varying, 'google_iap'::character varying]::text[])", name: "chk_subscriptions_source"
    t.check_constraint "status::text = ANY (ARRAY['active'::character varying, 'past_due'::character varying, 'canceled'::character varying, 'trialing'::character varying, 'incomplete'::character varying]::text[])", name: "chk_subscriptions_status"
  end

  create_table "users", force: :cascade do |t|
    t.boolean "calm_mode", default: false, null: false
    t.date "calm_mode_until"
    t.datetime "created_at", null: false
    t.integer "current_streak", default: 0, null: false
    t.string "display_name"
    t.string "email_address", null: false
    t.boolean "evening_notification_enabled", default: false, null: false
    t.integer "failed_login_count", default: 0, null: false
    t.date "last_active_date"
    t.datetime "locked_until"
    t.integer "longest_streak", default: 0, null: false
    t.boolean "morning_notification_enabled", default: true, null: false
    t.jsonb "otp_backup_codes_digests", default: [], null: false
    t.boolean "otp_enabled", default: false, null: false
    t.string "otp_secret"
    t.string "password_digest", null: false
    t.date "paused_until"
    t.string "preferred_certification"
    t.string "role", default: "user", null: false
    t.integer "streak_freeze_count", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["email_address"], name: "index_users_on_email_address", unique: true
    t.check_constraint "preferred_certification IS NULL OR (preferred_certification::text = ANY (ARRAY['ip'::character varying, 'fe'::character varying, 'genai'::character varying, 'gken'::character varying]::text[]))", name: "chk_users_preferred_certification"
    t.check_constraint "role::text = ANY (ARRAY['user'::character varying, 'admin'::character varying]::text[])", name: "chk_users_role"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "audit_logs", "users"
  add_foreign_key "courses", "certifications"
  add_foreign_key "daily_activities", "users"
  add_foreign_key "lesson_completions", "lessons"
  add_foreign_key "lesson_completions", "users"
  add_foreign_key "lessons", "sections"
  add_foreign_key "question_review_states", "questions"
  add_foreign_key "question_review_states", "users"
  add_foreign_key "questions", "lessons"
  add_foreign_key "quiz_results", "questions"
  add_foreign_key "quiz_results", "users"
  add_foreign_key "sections", "courses"
  add_foreign_key "sessions", "users"
  add_foreign_key "solid_queue_blocked_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_claimed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_failed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_ready_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_recurring_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_scheduled_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "subscriptions", "users"
end
