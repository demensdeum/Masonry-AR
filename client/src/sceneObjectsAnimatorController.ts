import { GameVector3 } from "./gameVector3.js"
import { SceneObjectsAnimatorControllerDelegate } from "./sceneObjectsAnimatorControllerDelegate.js"
import { SceneObjectsAnimatorControllerPosition } from "./sceneObjectsAnimatorControllerPosition.js"
import { debugPrint } from "./runtime.js"

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

    scroll(
        offset: GameVector3
    )
    {
        for (const key in this.positions) {
            const positionItem = this.positions[key]
            positionItem.currentPosition = positionItem.currentPosition.add(offset)
            positionItem.toPosition = positionItem.toPosition.add(offset)
            debugPrint(`scroll offset: ${offset.printable()}`)
        }
    }

    step() {
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