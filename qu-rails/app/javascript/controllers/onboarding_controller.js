import { Controller } from "@hotwired/stimulus"

// オンボーディングのプレビュー問題用コントローラ。
// DB 書き込みなし。クライアント側のみで正誤表示・解説を行う。
// targets:
//   choice        ... 各選択肢ボタン
//   feedback      ... 正誤フィードバックエリア（hidden で開始）
//   feedbackBadge ... 正誤メッセージを載せるバッジ
//   explanation   ... 解説テキストエリア
// values:
//   correctId ... 正答の choice id（サーバからレンダリング時に注入）
export default class extends Controller {
  static targets = ["choice", "feedback", "feedbackBadge", "explanation"]
  static values  = { correctId: String }

  connect() {
    this.answered = false
    this.keyHandler = this.onKey.bind(this)
    document.addEventListener("keydown", this.keyHandler)
  }

  disconnect() {
    document.removeEventListener("keydown", this.keyHandler)
  }

  selectChoice(event) {
    if (this.answered) return
    this.applyAnswer(event.currentTarget.dataset.choiceId)
  }

  applyAnswer(choiceId) {
    if (this.answered) return
    this.answered = true

    const correct = choiceId === this.correctIdValue

    // 全ボタンを操作不可にし、正誤色を適用
    this.choiceTargets.forEach((btn) => {
      btn.disabled = true
      btn.style.cursor = "default"

      const isChosen  = btn.dataset.choiceId === choiceId
      const isCorrect = btn.dataset.choiceId === this.correctIdValue

      // 正答を常に明示
      if (isCorrect) {
        btn.classList.add("border-correct", "bg-correct-soft", "text-correct")
        btn.classList.remove("border-border-subtle", "bg-surface", "text-content", "hover:bg-surface-sunken")
      }
      // 誤答を選んだ場合、その選択肢を incorrect 色に
      if (isChosen && !isCorrect) {
        btn.classList.add("border-incorrect", "bg-incorrect-soft", "text-incorrect")
        btn.classList.remove("border-border-subtle", "bg-surface", "text-content", "hover:bg-surface-sunken")
      }
    })

    // フィードバックバッジ
    if (this.hasFeedbackBadgeTarget) {
      const badge = this.feedbackBadgeTarget
      if (correct) {
        badge.textContent = "正解です"
        badge.className = "rounded-xl px-4 py-3 text-sm font-medium bg-correct-soft text-correct"
      } else {
        badge.textContent = "惜しい。解説を読めば次は大丈夫です。"
        badge.className = "rounded-xl px-4 py-3 text-sm font-medium bg-incorrect-soft text-incorrect"
      }
    }

    // フィードバックエリアを表示
    if (this.hasFeedbackTarget) {
      this.feedbackTarget.classList.remove("hidden")
    }
  }

  // キーボード: 1〜4 で選択肢（iPad 外付けキーボード対応）
  onKey(event) {
    if (this.answered) return
    if (event.metaKey || event.ctrlKey || event.altKey) return

    const index = parseInt(event.key, 10)
    if (index >= 1 && index <= this.choiceTargets.length) {
      event.preventDefault()
      this.applyAnswer(this.choiceTargets[index - 1].dataset.choiceId)
    }
  }
}
