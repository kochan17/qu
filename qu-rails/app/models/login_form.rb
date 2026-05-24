class LoginForm
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :email_address, :string
  attribute :password, :string

  attr_reader :user

  validate :credentials_are_present
  validate :credentials_are_valid

  private

  def credentials_are_present
    return if email_address.present? && password.present?

    errors.add(:base, "メールアドレスとパスワードを入力してください。")
  end

  def credentials_are_valid
    return if email_address.blank? || password.blank?

    @user = User.authenticate_by(email_address:, password:)
    errors.add(:base, "メールアドレスまたはパスワードが正しくありません。") unless @user
  end
end
