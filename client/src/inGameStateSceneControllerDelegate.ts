import { int, float } from "./types.js"
import { InGameStateSceneController } from "./inGameStateSceneController.js"

export interface InGameStateSceneControllerDelegate {
    inGameStateControllerDidMoveCamera(
        inGameStateSceneController: InGameStateSceneController,
        x: float,
        y: float,
        z: float
    ): void

    inGameStateControllerDidReceiveName(
        inGameStateSceneController: InGameStateSceneController,
        name: string
    ): void

    inGameStateControllerDidReceiveBalance(
        inGameStateSceneController: InGameStateSceneController,
        balance: int
    ): void

    inGameStateControllerDidReceiveOrder(
        inGameStateSceneController: InGameStateSceneController,
        order: string
    ): void    
}