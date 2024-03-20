import { Vector3 } from "three";

export class SceneObjectsAnimatorControllerPosition {
    currentPosition: Vector3
    toPosition: Vector3

    constructor(
        currentPosition: Vector3,
        toPosition: Vector3
    ) {
        this.currentPosition = currentPosition
        this.toPosition = toPosition
    }
}