// Stimulus コントローラの登録。esbuild はグロブ import 非対応のため明示登録する。
import { application } from "./application"

import FlashController from "./flash_controller"
import PracticeController from "./practice_controller"
import OnboardingController from "./onboarding_controller"

application.register("flash", FlashController)
application.register("practice", PracticeController)
application.register("onboarding", OnboardingController)
