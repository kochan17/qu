// Stimulus コントローラの登録。esbuild はグロブ import 非対応のため明示登録する。
import { application } from "./application"

import AccordionController from "./accordion_controller"
import FlashController from "./flash_controller"
import PasswordToggleController from "./password_toggle_controller"
import PracticeController from "./practice_controller"
import TabsController from "./tabs_controller"

application.register("accordion", AccordionController)
application.register("flash", FlashController)
application.register("password-toggle", PasswordToggleController)
application.register("practice", PracticeController)
application.register("tabs", TabsController)
