import { HeroStatusController } from "./heroStatusController.js";

export interface HeroStatusControllerDelegate {
    heroStatusControllerDidChange(controller: HeroStatusController, order: string): void
    heroStatusControllerDidReceiveError(controller: HeroStatusController, string: string): void
}