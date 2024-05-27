import { GameInitializationController } from "./gameInitializationController.js";

export interface GameInitializationControllerDelegate{
    gameInitializationControllerDidAuthorize(controller: GameInitializationController, heroUUID: string): void
    gameInitializationControllerDidReceiveError(controller: GameInitializationController, message: string): void
}