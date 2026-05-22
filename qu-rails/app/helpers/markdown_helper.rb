module MarkdownHelper
  # レッスン本文（Markdown）を HTML に変換する。
  # escape_html: true で本文中の生 HTML をエスケープし、XSS を防ぐ。
  def render_markdown(text)
    return "".html_safe if text.blank?

    renderer = Redcarpet::Render::HTML.new(escape_html: true, hard_wrap: false)
    markdown = Redcarpet::Markdown.new(renderer,
      tables: true,
      fenced_code_blocks: true,
      autolink: true,
      strikethrough: true,
      no_intra_emphasis: true,
      space_after_headers: true)

    markdown.render(text).html_safe
  end
end
