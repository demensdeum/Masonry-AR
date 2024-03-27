import { float } from "./types.js"
import { InGameStateSceneController } from "./inGameStateSceneController.js"

export interface InGameStateSceneControllerDelegate {
    inGameStateControllerDidMoveCamera(
        inGameStateSceneController: InGameStateSceneController,
        x: float,
        y: float,
        z: float
    ): void
}