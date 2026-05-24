# Content Security Policy — XSS とデータ吸い出しを抑止する。
# strict policy: default 'self' / inline script 不許可 / フォントは Google のみ許可。
# 既存 view の `style="..."` 属性のみ style-src-attr 'unsafe-inline' で許す
# （inline <style> ブロックは引き続き不許可）。
Rails.application.configure do
  config.content_security_policy do |policy|
    policy.default_src    :self
    policy.script_src     :self
    policy.style_src      :self, "https://fonts.googleapis.com"
    policy.style_src_attr :unsafe_inline
    policy.font_src       :self, :data, "https://fonts.gstatic.com"
    policy.img_src        :self, :data, :blob
    policy.media_src      :self, :blob
    policy.connect_src    :self
    policy.object_src     :none
    policy.frame_ancestors :none
    policy.base_uri       :self
    policy.form_action    :self
  end
end
