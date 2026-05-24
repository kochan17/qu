import { Controller } from "@hotwired/stimulus"

// パスワード入力の表示/非表示を切り替える。アイコン1個の textContent を
// visibility ↔ visibility_off で差し替える（Material Symbols のリガチャ）。
export default class extends Controller {
  static targets = ["input", "icon"]

  toggle() {
    const willShow = this.inputTarget.type === "password"
    this.inputTarget.type = willShow ? "text" : "password"
    // アイコンは現在の状態を示す: 表示中=visibility / 非表示=visibility_off。
    if (this.hasIconTarget) {
      this.iconTarget.textContent = willShow ? "visibility" : "visibility_off"
    }
  }
}
