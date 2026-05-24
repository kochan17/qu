class PracticeQueue
  attr_reader :user

  def initialize(user)
    @user = user
  end

  def counts
    return { due: 0, new: 0 } if certification.nil?

    question_ids = Question.for_certification(certification).ids
    states       = user.question_review_states.where(question_id: question_ids)
    { due: states.due.count, new: question_ids.size - states.count }
  end

  def next_question(lesson: nil)
    lesson ? lesson_question(lesson) : daily_question
  end

  private

  def certification
    @certification ||= Certification.published.find_by(slug: user.preferred_certification)
  end

  def lesson_question(lesson)
    mastered = user.quiz_results.where(is_correct: true).select(:question_id)
    lesson.questions.published.ordered.where.not(id: mastered).first
  end

  def daily_question
    return if certification.nil?

    pool = Question.for_certification(certification)
    due_question(pool) || fresh_question(pool)
  end

  def due_question(pool)
    user.question_review_states.due.where(question: pool)
        .order(:due_at).includes(:question).first&.question
  end

  def fresh_question(pool)
    pool.where.not(id: user.question_review_states.select(:question_id)).in_content_order.first
  end
end
