import { ObjectsPickerController } from "./objectsPickerController.js";
import { SceneObject } from "./sceneObject.js";

export interface ObjectsPickerControllerDelegate {
    objectsPickerControllerDidPickObject(
        controller: ObjectsPickerController,
        object: SceneObject
    ): void
}