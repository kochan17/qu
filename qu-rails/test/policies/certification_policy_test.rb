# frozen_string_literal: true

require "test_helper"

class CertificationPolicyTest < ActiveSupport::TestCase
  setup do
    @general     = users(:general)
    @admin       = users(:admin)
    @published   = certifications(:ip)
    @unpublished = certifications(:fe)
  end

  # 未ログインは published 資格を show できる
  test "未ログインは published 資格を show できる" do
    assert CertificationPolicy.new(nil, @published).show?
  end

  # 未ログインは unpublished 資格を show できない
  test "未ログインは unpublished 資格を show できない" do
    refute CertificationPolicy.new(nil, @unpublished).show?
  end

  # 一般ユーザーは published 資格を show できる
  test "一般ユーザーは published 資格を show できる" do
    assert CertificationPolicy.new(@general, @published).show?
  end

  # 一般ユーザーは unpublished 資格を show できない
  test "一般ユーザーは unpublished 資格を show できない" do
    refute CertificationPolicy.new(@general, @unpublished).show?
  end

  # 一般ユーザーは create できない
  test "一般ユーザーは create できない" do
    refute CertificationPolicy.new(@general, Certification.new).create?
  end

  # admin は unpublished 資格も show できる
  test "admin は unpublished 資格も show できる" do
    assert CertificationPolicy.new(@admin, @unpublished).show?
  end

  # admin は create できる
  test "admin は create できる" do
    assert CertificationPolicy.new(@admin, Certification.new).create?
  end

  # Scope は published のみ返す
  test "Scope#resolve は一般ユーザーに published 資格のみ返す" do
    scope = CertificationPolicy::Scope.new(@general, Certification).resolve
    assert_includes scope, @published
    refute_includes scope, @unpublished
  end

  # admin の Scope は全件返す
  test "Scope#resolve は admin に全件返す" do
    scope = CertificationPolicy::Scope.new(@admin, Certification).resolve
    assert_includes scope, @published
    assert_includes scope, @unpublished
  end
end
