import { Controller } from "@hotwired/stimulus"

// 演習画面 — 選択肢の選択とキーボードショートカット。
// targets:
//   choice ... 各選択肢ボタン
//   input  ... 選択した choice id を載せる hidden field
//   submit ... 解答ボタン
export default class extends Controller {
  static targets = ["choice", "input", "submit"]

  connect() {
    this.selected = null
    this.keyHandler = this.onKey.bind(this)
    document.addEventListener("keydown", this.keyHandler)
  }

  disconnect() {
    document.removeEventListener("keydown", this.keyHandler)
  }

  // 選択肢クリック
  select(event) {
    const button = event.currentTarget
    this.applySelection(button.dataset.choiceId)
  }

  applySelection(choiceId) {
    this.selected = choiceId
    this.choiceTargets.forEach((el) => {
      const active = el.dataset.choiceId === choiceId
      el.dataset.selected = active ? "true" : "false"
      el.setAttribute("aria-checked", active ? "true" : "false")
    })
    if (this.hasInputTarget) this.inputTarget.value = choiceId
    if (this.hasSubmitTarget) this.submitTarget.disabled = false
  }

  // キーボード: 1〜4 で選択肢、Enter で解答（iPad 外付けキーボード対応）
  onKey(event) {
    if (event.metaKey || event.ctrlKey || event.altKey) return

    const index = parseInt(event.key, 10)
    if (index >= 1 && index <= this.choiceTargets.length) {
      event.preventDefault()
      this.applySelection(this.choiceTargets[index - 1].dataset.choiceId)
      return
    }

    if (event.key === "Enter" && this.selected && this.hasSubmitTarget && !this.submitTarget.disabled) {
      event.preventDefault()
      this.element.requestSubmit(this.submitTarget)
    }
  }
}
