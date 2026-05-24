# frozen_string_literal: true

# frozen_string_literal: true

namespace :content do
  desc "content/ の YAML / Markdown を読み取り、カリキュラムを DB へ取り込む。"
  task import: :environment do
    require Rails.root.join("lib", "content", "importer")
    stdout_logger = Logger.new($stdout)
    stdout_logger.formatter = ->(_, _, _, msg) { "#{msg}\n" }
    Rails.logger.broadcast_to(stdout_logger)
    Content::Importer.new.import!
  ensure
    Rails.logger.stop_broadcasting_to(stdout_logger)
  end
end
