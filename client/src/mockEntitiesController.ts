import { EntitiesControllerDelegate } from "./entitiesControllerDelegate.js"
import { EntitiesControllerInterface } from "./entitiesControllerInterface.js"
import { Entity } from "./entity.js"
import { GameGeolocationPosition } from "./gameGeolocationPosition.js"
import { Utils} from "./utils.js"
import { MockEntitiesControllerDataSource } from "./mockEntitiesControllerDataSource.js"

export class MockEntitiesController implements EntitiesControllerInterface {

    public delegate: EntitiesControllerDelegate
    public dataSource?: MockEntitiesControllerDataSource

    readonly eye = new Entity(
        1,
        Utils.generateUUID(),
        "eye-1",
        "NONE",
        "NONE",
        "eye",
        "DEFAULT",
        1000,
        new GameGeolocationPosition(0.0, 0.0)
    )

    readonly building = new Entity(
        2,
        Utils.generateUUID(),
        "building-1",
        "NONE",
        "NONE",
        "building",
        "DEFAULT",
        0,
        new GameGeolocationPosition(0.0, 0.0)
    )

    readonly hero = new Entity(
        3,
        Utils.generateUUID(),
        "hero-1",
        "NONE",
        "NONE",
        "hero",
        "com.demensdeum.cat.gray",
        1000,
        new GameGeolocationPosition(0.0, 0.0)
    )    

    private isEyePositionSet = false
    private isBuildingOnSceneSet = false

    constructor(
        delegate: EntitiesControllerDelegate
    )
    {
        this.delegate = delegate
    }

    async getEntities(position: GameGeolocationPosition): Promise<void> {
        if (this.isEyePositionSet == false) {
            this.eye.position = position.clone()
            this.hero.position = position.clone()
            //this.hero.position.longitude -= 0.0002
            this.isEyePositionSet = true
        }
        else {
            this.eye.position.latitude -= 0.0001
            this.hero.position.longitude += 0.0001
            //this.eye.position.longitude += 0.0004
        }
        var entities = [this.eye, this.hero]
        if (this.isBuildingOnSceneSet) {
            entities.push(this.building)
        }
        this.delegate.entitiesControllerDidFetchEntities(
            this, 
            entities
        )
    }

    async build(): Promise<void> {
        if (this.isBuildingOnSceneSet) {
            this.delegate.entitiesControllerDidNotBuildEntity(
                this,
                "There is building in this area already!"
            )
        }
        else {
            const position = this.dataSource?.mockEntitiesControllerDidRequestGeolocationPosition(this)
            if (position) {
                this.building.position = position.clone()
                this.isBuildingOnSceneSet = true
                this.delegate.entitiesControllerDidBuildEntity(
                    this,
                    this.building
                )
            }
        }
    }

    async destroy(entity: Entity): Promise<void> {
        this.delegate.entitiesControllerDidDestroyEntity(
            this,
            entity
        )
        this.isBuildingOnSceneSet = false        
    }

    async catch(_: Entity): Promise<void> {
        this.delegate.entitiesControllerDidCatchEntity(
            this,
            this.eye
        )
        this.isEyePositionSet = false
    }
}