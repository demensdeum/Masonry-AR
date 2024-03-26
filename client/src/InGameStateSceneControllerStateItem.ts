import { Entity } from "./entity.js"
import { GameGeolocationPosition } from "./gameGeolocationPosition.js"
import { UUID } from "./types.js"

export class InGameStateSceneControllerStateItem {
    readonly entity: Entity
    readonly sceneObjectUUID: UUID
    readonly renderingPosition: GameGeolocationPosition
    readonly actualPosition: GameGeolocationPosition

    constructor(
        entity: Entity,
        sceneObjectUUID: UUID,
        currentPosition: GameGeolocationPosition,
        actualPosition: GameGeolocationPosition
    )
    {
        this.entity = entity
        this.sceneObjectUUID = sceneObjectUUID
        this.renderingPosition = currentPosition.clone()
        this.actualPosition = actualPosition.clone()
    }
}