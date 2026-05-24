import { Controller } from "@hotwired/stimulus"

// 折りたたみセクション。ヘッダーのトグルで本文パネルの開閉を切り替える。
export default class extends Controller {
  static targets = ["panel", "icon"]
  static values = { open: { type: Boolean, default: false } }

  toggle() {
    this.openValue = !this.openValue
  }

  openValueChanged() {
    this.panelTarget.classList.toggle("hidden", !this.openValue)
    if (this.hasIconTarget) {
      this.iconTarget.classList.toggle("rotate-180", this.openValue)
    }
  }
}
