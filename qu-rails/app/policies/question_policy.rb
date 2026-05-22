# frozen_string_literal: true

# 公開判定は status='published'（Question は is_published を持たず enum status を使う）。
class QuestionPolicy < PublicContentPolicy
end
