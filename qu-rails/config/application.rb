require_relative "boot"

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_mailbox/engine"
require "action_text/engine"
require "action_view/railtie"
require "action_cable/engine"
# require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module QuRails
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 8.1

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w[assets tasks])

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # Don't generate system test files.
    config.generators.system_tests = nil

    config.i18n.default_locale = :ja
    config.i18n.load_path += Dir[Rails.root.join("config/locales/**/*.yml")]

    # Pundit の `after_action :verify_authorized, except: :index` / `:verify_policy_scoped, only: :index` を
    # 全 controller に適用しているため、`resources :lessons, only: :show` のように index を持たない
    # controller でも :index を参照するコールバックが宣言される。
    # Rails 7.1+ の missing-callback-actions チェックはこれを ActionNotFound として 404 にしてしまうので
    # 無効化する。タイポ検知の安全網は失われるが、テストカバレッジで担保する。
    config.action_controller.raise_on_missing_callback_actions = false
  end
end
