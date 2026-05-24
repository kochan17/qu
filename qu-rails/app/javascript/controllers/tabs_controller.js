import { Controller } from "@hotwired/stimulus"

// タブ切り替え。tab と panel を出現順で対応づける。
export default class extends Controller {
  static targets = ["tab", "panel"]

  select(event) {
    const index = this.tabTargets.indexOf(event.currentTarget)
    this.tabTargets.forEach((tab, i) => tab.toggleAttribute("data-active", i === index))
    this.panelTargets.forEach((panel, i) => panel.classList.toggle("hidden", i !== index))
  }
}
