Rails.application.routes.draw do
  resource :session, only: [ :new, :create, :destroy ]

  resources :passwords, only: [ :new, :create, :edit, :update ], param: :token

  resource :registration, only: [ :new, :create ]

  resource :settings, only: [ :show, :update ], controller: "settings"

  resource :otp,           only: %i[new create destroy], controller: "otps"
  resource :otp_challenge, only: %i[new create],         controller: "otp_challenges"

  resources :courses, only: [ :index, :show ]

  resources :lessons, only: [ :show ] do
    resource :completion, only: [ :create ], controller: "lesson_completions"
  end

  resource :practice, only: [ :show ], controller: "practice"

  resources :quiz_results, only: [ :create ]

  # 運営者向けの閲覧専用ダッシュボード。コンテンツの作成・編集は `bin/rails content:import`
  # でファイル（content/）から取り込むため、Admin に CRUD は持たせない。
  namespace :admin do
    root "dashboard#index"
  end

  # ハニーポット — 典型的なスキャナのプローブを記録する。常に 404 を返す。
  %w[
    /wp-admin /wp-login.php /xmlrpc.php /phpmyadmin
    /admin.php /administrator /server-status
  ].each { |path| get path, to: "honeypots#trip" }

  get "up" => "rails/health#show", as: :rails_health_check

  root "dashboard#index"
end
