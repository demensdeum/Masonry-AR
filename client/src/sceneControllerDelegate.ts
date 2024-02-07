import { SceneController } from './sceneController.js'

export interface SceneControllerDelegate {
    sceneControllerDidPickSceneObjectWithName(
        controller: SceneController,
        name: string
    ): void
}