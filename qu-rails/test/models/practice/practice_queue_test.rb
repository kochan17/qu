# frozen_string_literal: true

require "test_helper"

class PracticeQueueTest < ActiveSupport::TestCase
  # ---------------------------------------------------------------------------
  # counts
  # ---------------------------------------------------------------------------

  test "preferred_certification がない場合 counts が { due: 0, new: 0 } を返す" do
    user = users(:general)
    assert_nil user.preferred_certification

    queue = PracticeQueue.new(user)
    assert_equal({ due: 0, new: 0 }, queue.counts)
  end

  test "preferred_certification が設定されている場合 counts が hash を返す" do
    user = users(:general)
    user.update!(preferred_certification: "ip")

    queue = PracticeQueue.new(user)
    counts = queue.counts

    assert_includes counts, :due
    assert_includes counts, :new
    assert counts[:due] >= 0
    assert counts[:new] >= 0
  end

  test "counts の due + new がコース内の公開問題数と一致する（レビュー未実施時）" do
    user = users(:general)
    user.update!(preferred_certification: "ip")
    cert = Certification.published.find_by(slug: "ip")

    total_questions = Question.for_certification(cert).count
    counts = PracticeQueue.new(user).counts

    assert_equal total_questions, counts[:due] + counts[:new]
  end

  # ---------------------------------------------------------------------------
  # next_question（lesson スコープなし）
  # ---------------------------------------------------------------------------

  test "preferred_certification なしの場合 next_question(lesson: nil) が nil を返す" do
    user = users(:general)
    assert_nil PracticeQueue.new(user).next_question(lesson: nil)
  end

  test "preferred_certification 設定済みなら next_question が Question を返す" do
    user = users(:general)
    user.update!(preferred_certification: "ip")

    question = PracticeQueue.new(user).next_question(lesson: nil)
    assert_instance_of Question, question
  end

  test "全問回答済みなら next_question(lesson: nil) が nil を返す" do
    user = users(:general)
    user.update!(preferred_certification: "ip")
    cert = Certification.published.find_by(slug: "ip")

    # PracticeQueue#daily_question は question_review_states で判定するため、
    # 全問に対して due ではない（=未来 due）の review_state を作る必要がある。
    Question.for_certification(cert).each do |q|
      user.question_review_states.create!(
        question: q,
        due_at: 1.week.from_now,
        stability: 1.0,
        difficulty: 5.0,
        reps: 1,
        lapses: 0
      )
    end

    assert_nil PracticeQueue.new(user).next_question(lesson: nil)
  end

  # ---------------------------------------------------------------------------
  # next_question（lesson スコープあり）
  # ---------------------------------------------------------------------------

  test "next_question(lesson:) がそのレッスンの未回答問題を返す" do
    user = users(:general)
    lesson = lessons(:company_1)

    question = PracticeQueue.new(user).next_question(lesson: lesson)
    assert_not_nil question
    assert_equal lesson.id, question.lesson_id
  end

  test "lesson 内の全問正答済みなら next_question(lesson:) が nil を返す" do
    user = users(:general)
    lesson = lessons(:company_1)

    lesson.questions.published.each do |q|
      user.quiz_results.create!(question: q, selected_choice_id: q.correct_choice_id, is_correct: true)
    end

    assert_nil PracticeQueue.new(user).next_question(lesson: lesson)
  end
end
