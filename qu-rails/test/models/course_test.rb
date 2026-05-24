# frozen_string_literal: true

require "test_helper"

class CourseTest < ActiveSupport::TestCase
  # ---------------------------------------------------------------------------
  # Publishable concern
  # ---------------------------------------------------------------------------

  test "Course.published が is_published: true のもののみ返す" do
    published_count = Course.where(is_published: true).count
    assert_equal published_count, Course.published.count
  end

  test "Course.ordered が position 順に返す" do
    courses = Course.published.ordered.to_a
    assert_equal courses.sort_by(&:position), courses
  end

  # ---------------------------------------------------------------------------
  # progress_summary_for
  # ---------------------------------------------------------------------------

  test "progress_summary_for は total と completed の hash を返す" do
    user = users(:general)
    courses = Course.published.to_a
    summary = Course.progress_summary_for(courses, user)

    courses.each do |course|
      assert_includes summary, course.id
      assert_includes summary[course.id], :total
      assert_includes summary[course.id], :completed
    end
  end

  test "progress_summary_for の total はコース内の公開レッスン数と一致する" do
    user = users(:general)
    course = courses(:ip_strategy)
    summary = Course.progress_summary_for([ course ], user)

    expected_total = Lesson.published
                           .joins(:section)
                           .where(sections: { course_id: course.id, is_published: true })
                           .count
    assert_equal expected_total, summary[course.id][:total]
  end

  test "progress_summary_for は LessonCompletion がない場合 completed が 0" do
    user = users(:admin)
    course = courses(:ip_strategy)
    summary = Course.progress_summary_for([ course ], user)

    assert_equal 0, summary[course.id][:completed]
  end

  test "progress_summary_for は LessonCompletion を反映して completed を返す" do
    # general は fixture で既に company_1 を完了済みなので、admin で追加する形にする
    user = users(:admin)
    lesson = lessons(:company_1)
    user.lesson_completions.create!(lesson: lesson)

    course = courses(:ip_strategy)
    summary = Course.progress_summary_for([ course ], user)

    assert_equal 1, summary[course.id][:completed]
  end

  test "progress_summary_for は複数コースを N+1 なしに返す" do
    # クエリ数が 2 本に収まることを確認（N+1 にならない）
    user = users(:general)
    all_courses = Course.published.to_a

    query_count = 0
    counter = ->(*) { query_count += 1 }
    ActiveSupport::Notifications.subscribed(counter, "sql.active_record") do
      Course.progress_summary_for(all_courses, user)
    end

    # total と done の 2 本のクエリ + courses の取得を想定（3 本以内）
    assert query_count <= 3, "クエリ数が多すぎる: #{query_count}"
  end
end
