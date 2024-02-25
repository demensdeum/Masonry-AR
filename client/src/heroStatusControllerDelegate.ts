import { HeroStatusController } from "./heroStatusController.js";

export interface HeroStatusControllerDelegate {
    heroStatusControllerDidChange(controller: HeroStatusController, order: String): void
    heroStatusControllerDidReceiveError(controller: HeroStatusController, string: String): void
}