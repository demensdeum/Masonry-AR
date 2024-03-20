import { debugPrint } from "./runtime.js";
import { GameVector3 } from "./gameVector3.js";
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
        position: GameVector3
    ) {
        this.positions[uuid] = new SceneObjectsAnimatorControllerPosition(
            position.clone(),
            position.clone(),
            0.02,            
        )
    }

    movePosition(
        uuid: string,
        position: GameVector3
    ) {
        const positionItem = this.positions[uuid]
        positionItem.toPosition = position
    }

    removePosition(
        uuid: string
    ) {
        delete this.positions[uuid]
    }

    step() {
        debugPrint("SceneObjectsAnimatorController step")
        for (const key in this.positions) {
            const positionItem = this.positions[key]
            positionItem.currentPosition = positionItem.moveVector()
            this.delegate.sceneObjectsAnimatorControllerDidRequireToMoveObject(
                this,
                key,
                positionItem.currentPosition
            )
        }
    }
}