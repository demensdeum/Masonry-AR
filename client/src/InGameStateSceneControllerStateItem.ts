import { Entity } from "./entity.js"
import { GameVector3 } from "./gameVector3.js"
import { UUID } from "./types.js"

export class InGameStateSceneControllerStateItem {
    readonly entity: Entity
    readonly sceneObjectUUID: UUID
    readonly currentPosition: GameVector3
    readonly targetPosition: GameVector3

    constructor(
        entity: Entity,
        sceneObjectUUID: UUID,
        currentPosition: GameVector3,
        targetPosition: GameVector3
    )
    {
        this.entity = entity
        this.sceneObjectUUID = sceneObjectUUID
        this.currentPosition = currentPosition.clone()
        this.targetPosition = targetPosition.clone()
    }
}