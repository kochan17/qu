class User < ApplicationRecord
  has_secure_password
  has_many :sessions, dependent: :destroy

  normalizes :email_address, with: ->(e) { e.strip.downcase }

  validates :email_address, presence: true,
                            uniqueness: { case_sensitive: false },
                            format: { with: URI::MailTo::EMAIL_REGEXP }

  enum :role, { user: "user", admin: "admin" }, validate: true

  has_many :subscriptions,          dependent: :destroy
  has_many :quiz_results,           dependent: :destroy
  has_many :lesson_completions,     dependent: :destroy
  has_many :question_review_states, dependent: :destroy
  has_many :daily_activities,       dependent: :destroy

  validates :current_streak,      numericality: { greater_than_or_equal_to: 0 }
  validates :longest_streak,      numericality: { greater_than_or_equal_to: 0 }
  validates :streak_freeze_count, numericality: { greater_than_or_equal_to: 0 }
  validates :preferred_certification,
            inclusion: { in: %w[ ip fe genai gken ] }, allow_nil: true

  # `has_secure_password` は最低長を持たないので明示する。
  # 既存ユーザーの password 更新を伴わない save では発火しない（password 仮想属性は nil）。
  validates :password, length: { minimum: 12, message: "は12文字以上で設定してください。" },
            if: -> { password.present? }

  # `admin?` / `user?` は enum :role が自動生成する。

  MAX_FAILED_LOGINS = 5
  LOCKOUT_DURATION  = 15.minutes
  OTP_ISSUER        = "Qu"
  BACKUP_CODE_COUNT = 10

  def locked?
    locked_until.present? && locked_until > Time.current
  end

  # ログイン失敗を1件記録する。閾値を超えたらアカウントを一時凍結する。
  def register_failed_login!
    new_count = failed_login_count + 1
    attrs = { failed_login_count: new_count }
    attrs[:locked_until] = LOCKOUT_DURATION.from_now if new_count >= MAX_FAILED_LOGINS
    update!(attrs)
  end

  def register_successful_login!
    return if failed_login_count.zero? && locked_until.nil?

    update!(failed_login_count: 0, locked_until: nil)
  end

  # --- TOTP 2 要素認証 ---------------------------------------------------

  # 認証アプリ登録用の secret を未発行なら生成して返す。enable はしない。
  def ensure_otp_secret!
    update!(otp_secret: ROTP::Base32.random_base32) if otp_secret.blank?
    otp_secret
  end

  def totp
    return nil if otp_secret.blank?
    ROTP::TOTP.new(otp_secret, issuer: OTP_ISSUER)
  end

  def otp_provisioning_uri
    totp&.provisioning_uri(email_address)
  end

  # TOTP コードまたはバックアップコードを検証する。ドリフトに ±30s 許容。
  def verify_otp(code)
    return false if code.blank?
    cleaned = code.to_s.gsub(/\s/, "")
    return true if totp&.verify(cleaned, drift_behind: 30, drift_ahead: 30)
    consume_backup_code(cleaned)
  end

  # 認証アプリ初期登録の確定。バックアップコードを生成して平文で返す（1 回だけ表示用）。
  def confirm_otp!(code)
    return nil unless totp&.verify(code.to_s.gsub(/\s/, ""), drift_behind: 30, drift_ahead: 30)
    codes = regenerate_backup_codes
    update!(otp_enabled: true, otp_backup_codes_digests: codes.map { |c| backup_digest(c) })
    codes
  end

  def disable_otp!
    update!(otp_secret: nil, otp_enabled: false, otp_backup_codes_digests: [])
  end

  def consume_backup_code(code)
    digest = backup_digest(code)
    return false unless otp_backup_codes_digests.include?(digest)
    update!(otp_backup_codes_digests: otp_backup_codes_digests - [ digest ])
    true
  end

  private

  def regenerate_backup_codes
    Array.new(BACKUP_CODE_COUNT) { SecureRandom.alphanumeric(8).downcase }
  end

  def backup_digest(code)
    Digest::SHA256.hexdigest(code.to_s.strip.downcase)
  end

  public

  # 試験前などに演出（リング・通知・バッジ）を全て止めるモード。
  def calm_mode_active?
    calm_mode? || (calm_mode_until.present? && calm_mode_until >= Date.current)
  end

  # 今日の DailyActivity（なければ作成）。
  def today_activity
    daily_activities.find_or_create_by!(date: Date.current)
  end

  # ストリークを更新する。Mastery-anchored — Daily Ring が閉じた日だけ数える。
  def refresh_streak!(on_date: Date.current)
    activity = daily_activities.find_by(date: on_date)
    return unless activity&.core_completed?
    return if last_active_date == on_date

    self.current_streak   = (last_active_date == on_date - 1) ? current_streak + 1 : 1
    self.last_active_date = on_date
    self.longest_streak   = [ longest_streak, current_streak ].max
    save!
  end

end
