# frozen_string_literal: true

require "yaml"
require "pathname"

module Content
  # content/ ディレクトリ配下の YAML / Markdown を辿って、カリキュラムを upsert する。
  #
  # 期待するファイル構成:
  #   content/
  #   ├── ip.yml                     # 資格メタ（slug は ファイル名）
  #   └── ip/
  #       ├── strategy.yml           # コースメタ（title をキーに upsert）
  #       └── strategy/
  #           ├── company-act.yml    # セクションメタ（title をキーに upsert）
  #           └── company-act/
  #               ├── 01-overview.md          # レッスン Markdown + frontmatter
  #               └── 01-overview/            # 同名ディレクトリにアセットを置く
  #                   ├── video.mp4           # 動画レッスンの本体
  #                   └── images/
  #                       └── diagram1.png    # Markdown 本文用画像
  class Importer
    IMAGE_EXTENSIONS = %w[.png .jpg .jpeg .webp .svg].freeze

    def initialize(root: default_root, logger: Rails.logger)
      @root = Pathname.new(root)
      @logger = logger
    end

    def import!
      log "Content import: scanning #{@root}"
      unless @root.directory?
        log "(no content directory found at #{@root})"
        return
      end

      @counts = Hash.new(0)
      AuditLog.record!("content.import.started")
      Pathname.glob(@root.join("*.yml")).sort.each { |yml| import_certification(yml) }
      log "Content import: done."
      AuditLog.record!("content.import.completed", payload: { counts: @counts })
    end

    private

    def default_root
      Rails.root.join("..", "content").expand_path
    end

    def import_certification(yml)
      data = load_yaml(yml)
      cert = Certification.find_or_initialize_by(slug: data.fetch("slug"))
      cert.update!(data.slice("name", "slug", "category", "description", "position", "is_published"))
      @counts[:certifications] += 1
      Rails.logger.debug { "  [importer] cert: #{cert.name} (#{cert.slug})" }
      log "  cert: #{cert.name} (#{cert.slug})"

      cert_dir = yml.sub_ext("")
      return unless cert_dir.directory?

      Pathname.glob(cert_dir.join("*.yml")).sort.each { |f| import_course(f, cert) }
    end

    def import_course(yml, cert)
      data = load_yaml(yml)
      title = data.fetch("title")
      course = cert.courses.find_or_initialize_by(title: title)
      course.update!(data.slice("title", "description", "thumbnail_url", "position", "is_published"))
      @counts[:courses] += 1
      Rails.logger.debug { "  [importer] course: #{course.title}" }
      log "    course: #{course.title}"

      course_dir = yml.sub_ext("")
      return unless course_dir.directory?

      Pathname.glob(course_dir.join("*.yml")).sort.each { |f| import_section(f, course) }
    end

    def import_section(yml, course)
      data = load_yaml(yml)
      title = data.fetch("title")
      section = course.sections.find_or_initialize_by(title: title)
      section.update!(data.slice("title", "position", "is_published"))
      @counts[:sections] += 1
      Rails.logger.debug { "  [importer] section: #{section.title}" }
      log "      section: #{section.title}"

      section_dir = yml.sub_ext("")
      return unless section_dir.directory?

      Pathname.glob(section_dir.join("*.md")).sort.each { |f| import_lesson(f, section) }
    end

    def import_lesson(md_path, section)
      frontmatter, body = parse_markdown(md_path)
      slug = frontmatter.fetch("slug")

      lesson = section.lessons.find_or_initialize_by(slug: slug)
      lesson.assign_attributes(
        frontmatter.slice("title", "slug", "content_type",
                          "intro", "why_matters", "duration_seconds",
                          "position", "is_published")
      )
      lesson.body = body.strip.presence
      lesson.save!
      @counts[:lessons] += 1
      Rails.logger.debug { "  [importer] lesson: #{lesson.title} (#{lesson.slug})" }
      log "        lesson: #{lesson.title}"

      assets_dir = md_path.sub_ext("")
      attach_video(lesson, assets_dir.join("video.mp4"))   if assets_dir.join("video.mp4").file?
      attach_images(lesson, assets_dir.join("images"))     if assets_dir.join("images").directory?

      Array(frontmatter["questions"]).each_with_index do |q, idx|
        import_question(q, lesson, default_position: idx + 1)
      end
    end

    def import_question(raw, lesson, default_position:)
      position = raw["position"] || default_position
      question = lesson.questions.find_or_initialize_by(position: position)
      question.question_text     = raw.fetch("question_text")
      question.format            = raw.fetch("format")
      question.status            = raw.fetch("status", "draft")
      question.explanation       = raw["explanation"]
      question.correct_choice_id = raw["correct"]&.to_s
      question.choices           = build_choices(raw["choices"])
      question.save!
      @counts[:questions] += 1
      Rails.logger.debug { "  [importer] question: lesson_id=#{lesson.id} pos=#{question.position}" }
    end

    # YAML の choices はハッシュ {a: "text"} か配列 [{id:, text:}] のどちらも許容する。
    def build_choices(raw)
      case raw
      when Hash  then raw.map { |id, text| { "id" => id.to_s, "text" => text.to_s } }
      when Array then raw.map { |c| { "id" => c["id"].to_s, "text" => c["text"].to_s } }
      else            []
      end
    end

    # ファイル名が変わっていなければ再添付しない。差し替えたい時は事前に削除する。
    def attach_video(lesson, path)
      return if lesson.video.attached? && lesson.video.filename.to_s == path.basename.to_s

      lesson.video.attach(io: path.open("rb"),
                          filename: path.basename.to_s,
                          content_type: "video/mp4")
    end

    def attach_images(lesson, dir)
      existing = lesson.images.attachments.map { |a| a.filename.to_s }.to_set
      dir.children.sort.each do |img|
        next unless IMAGE_EXTENSIONS.include?(img.extname.downcase)
        next if existing.include?(img.basename.to_s)

        lesson.images.attach(io: img.open("rb"),
                             filename: img.basename.to_s,
                             content_type: Marcel::MimeType.for(img))
      end
    end

    def load_yaml(path)
      YAML.safe_load(path.read, permitted_classes: [ Date, Time ], aliases: true).to_h
    end

    def parse_markdown(path)
      raw = path.read
      if raw =~ /\A---\n(.*?)\n---\n?(.*)\z/m
        [ YAML.safe_load(::Regexp.last_match(1), permitted_classes: [ Date, Time ], aliases: true).to_h, ::Regexp.last_match(2) ]
      else
        [ {}, raw ]
      end
    end

    def log(msg)
      @logger.info(msg) if @logger
    end
  end
end
