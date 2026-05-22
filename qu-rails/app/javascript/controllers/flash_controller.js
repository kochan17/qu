import { Controller } from "@hotwired/stimulus"

// フラッシュメッセージを一定時間後に静かにフェードアウトさせる。
export default class extends Controller {
  static values = { dismissAfter: { type: Number, default: 5000 } }

  connect() {
    if (this.dismissAfterValue > 0) {
      this.timeout = setTimeout(() => this.dismiss(), this.dismissAfterValue)
    }
  }

  disconnect() {
    if (this.timeout) clearTimeout(this.timeout)
  }

  dismiss() {
    this.element.style.transition = "opacity 0.3s ease"
    this.element.style.opacity = "0"
    setTimeout(() => this.element.remove(), 300)
  }
}
