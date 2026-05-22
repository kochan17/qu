# frozen_string_literal: true

# 公開コンテンツ用の基底ポリシー。
# 公開済みレコードは全員 read 可。作成・更新・削除は admin のみ。
# 各コンテンツモデルは `published?` インスタンスメソッドと `published` スコープを持つ前提。
class PublicContentPolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    admin? || record.published?
  end

  def create?
    admin?
  end

  def update?
    admin?
  end

  def destroy?
    admin?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      user&.admin? ? scope.all : scope.published
    end
  end
end
