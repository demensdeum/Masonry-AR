import { EntitiesControllerDelegate } from "./entitiesControllerDelegate.js"
import { EntitiesControllerInterface } from "./entitiesControllerInterface.js"
import { Entity } from "./entity.js"
import { GameGeolocationPosition } from "./geolocationPosition.js"
import { Utils} from "./utils.js"

export class MockEntitiesController implements EntitiesControllerInterface {

    public delegate: EntitiesControllerDelegate
    readonly eye = new Entity(
        1,
        Utils.generateUUID(),
        "eye-1",
        "NONE",
        "NONE",
        "eye",
        "DEFAULT",
        100,
        new GameGeolocationPosition(0.0, 0.0)
    )
    private isEyePositionSet: boolean = false

    constructor(
        delegate: EntitiesControllerDelegate
    )
    {
        this.delegate = delegate
    }

    async getEntities(position: GameGeolocationPosition): Promise<void> {
        if (this.isEyePositionSet == false) {
            this.eye.position = position.clone()
            this.eye.position.latitude += 0.0005
            this.isEyePositionSet = true
        }
        this.delegate.entitiesControllerDidFetchEntities(
            this, 
            [this.eye]
        )
    }

    async build(): Promise<void> {

    }

    async destroy(_: Entity): Promise<void> {

    }

    async catch(_: Entity): Promise<void> {

    }
}