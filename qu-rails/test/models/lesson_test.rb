# frozen_string_literal: true

require "test_helper"

class LessonTest < ActiveSupport::TestCase
  # ---------------------------------------------------------------------------
  # Publishable concern
  # ---------------------------------------------------------------------------

  test "Lesson.published が is_published: true のもののみ返す" do
    assert_equal Lesson.where(is_published: true).count, Lesson.published.count
  end

  test "Lesson.ordered が position 順に返す" do
    lessons = Lesson.published.ordered.to_a
    assert_equal lessons.sort_by(&:position), lessons
  end

  # ---------------------------------------------------------------------------
  # siblings_in_course
  # ---------------------------------------------------------------------------

  test "コースの最初のレッスンは prev が nil" do
    lesson = lessons(:company_1) # ip_strategy コース内 section=company, position=0
    prev_lesson, _next_lesson = lesson.siblings_in_course
    assert_nil prev_lesson
  end

  test "コースの最後のレッスンは next が nil" do
    # ip_strategy コースは ip_strategy_company (position 0) と ip_strategy_law (position 1)
    # company の中: company_1(pos 0), company_2(pos 1)
    # law の中: law_1(pos 0), law_2(pos 1)
    # コース全体の order は section.position → lesson.position なので最後は law_2
    lesson = lessons(:law_2)
    _prev_lesson, next_lesson = lesson.siblings_in_course
    assert_nil next_lesson
  end

  test "コースの中間レッスンは前後両方が返る" do
    # company_1(0,0) → company_2(0,1) → law_1(1,0) → law_2(1,1)
    # company_2 は中間なので prev=company_1, next=law_1
    lesson = lessons(:company_2)
    prev_lesson, next_lesson = lesson.siblings_in_course
    assert_equal lessons(:company_1).id, prev_lesson.id
    assert_equal lessons(:law_1).id, next_lesson.id
  end

  test "is_published: false のレッスンは siblings_in_course から除外される" do
    # company_2 を非公開にして law_1 の prev が company_1 になることを確認
    lessons(:company_2).update!(is_published: false)
    lesson = lessons(:law_1)
    prev_lesson, _next = lesson.siblings_in_course
    assert_equal lessons(:company_1).id, prev_lesson.id
  end

  # ---------------------------------------------------------------------------
  # user_progress
  # ---------------------------------------------------------------------------

  test "user_progress は正答済み問題数と公開問題数を返す" do
    # general は fixture で既に company_1_q1 を正答済みなので、QuizResult を持たない admin で検証する
    user = users(:admin)
    lesson = lessons(:company_1)
    progress = lesson.user_progress(user)

    assert_includes progress, :done
    assert_includes progress, :total
    assert_equal lesson.questions.published.count, progress[:total]
    assert_equal 0, progress[:done]
  end

  test "user_progress は正答済みカウントが正しく反映される" do
    user = users(:general)
    lesson = lessons(:company_1)
    question = questions(:company_1_q1)

    # 正答を 1 件作成
    user.quiz_results.create!(question: question, selected_choice_id: "a", is_correct: true)

    progress = lesson.user_progress(user)
    assert_equal 1, progress[:done]
  end
end
