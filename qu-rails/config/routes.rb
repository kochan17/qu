Rails.application.routes.draw do
  # ── 認証（Rails 8 標準ジェネレータ）──────────────────────────
  resource  :session
  resources :passwords, param: :token
  resource  :registration, only: %i[ new create ]

  # ── オンボーディング（資格選択 + 1 問プレビュー）─────────────
  resource :onboarding, only: %i[ show update ], controller: "onboarding"

  # ── 設定 ────────────────────────────────────────────────────
  resource :settings, only: %i[ show update ], controller: "settings"

  # ── 学習コンテンツ（Apple Books 風）──────────────────────────
  resources :courses, only: %i[ index show ]
  resources :lessons, only: %i[ show ] do
    resource :completion, only: :create, controller: "lesson_completions"
  end

  # ── 演習（Practice）────────────────────────────────────────
  # 既定は FSRS 由来の今日のキュー。?lesson_id= でレッスン単位の演習。
  resource  :practice, only: :show, controller: "practice"
  resources :quiz_results, only: :create

  # ── インフラ ────────────────────────────────────────────────
  get "up" => "rails/health#show", as: :rails_health_check

  root "dashboard#index"
end
