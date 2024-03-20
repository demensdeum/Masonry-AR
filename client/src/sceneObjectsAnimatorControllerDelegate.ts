import { GameVector3 } from "./gameVector3.js"
import { SceneObjectsAnimatorController } from "./sceneObjectsAnimatorController.js"

export interface SceneObjectsAnimatorControllerDelegate {
    sceneObjectsAnimatorControllerDidRequireToMoveObject(
        sceneObjectsAnimatorController: SceneObjectsAnimatorController,
        objectUuid: string,
        position: GameVector3
    ): void
}