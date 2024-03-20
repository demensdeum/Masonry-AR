import { Vector3 } from "three";
import { SceneObjectsAnimatorControllerDelegate } from "./sceneObjectsAnimatorControllerDelegate.js";
import { SceneObjectsAnimatorControllerPosition } from "./sceneObjectsAnimatorControllerPosition.js"

export class SceneObjectsAnimatorController {

    public delegate: SceneObjectsAnimatorControllerDelegate

    private positions: { [key: string]: SceneObjectsAnimatorControllerPosition } = {};

    constructor(
        delegate: SceneObjectsAnimatorControllerDelegate
    ) {
        this.delegate = delegate
    }

    addPosition(
        uuid: string,
        position: Vector3
    ) {
        this.positions[uuid] = new SceneObjectsAnimatorControllerPosition(
            position.clone(),
            position.clone()
        )
    }

    movePosition(
        uuid: string,
        position: Vector3
    ) {
        this.positions[uuid].toPosition = position
    }

    removePosition(
        uuid: string
    ) {
        delete this.positions[uuid]
    }

    step() {

    }
}