import { Vector3 } from "three"
import { SceneObjectsAnimatorController } from "./sceneObjectsAnimatorController.js"

export interface SceneObjectsAnimatorControllerDelegate {
    sceneObjectsAnimatorControllerDidRequireToMoveObject(
        sceneObjectsAnimatorController: SceneObjectsAnimatorController,
        objectUuid: string,
        position: Vector3
    ): void
}