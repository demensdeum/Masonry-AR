import { GameGeolocationPosition } from "./geolocationPosition.js"
import { Entity } from "./entity.js"

export interface EntitiesControllerInterface {
    getEntities(position: GameGeolocationPosition): Promise<void>
    build(): Promise<void>
    destroy(entity: Entity): Promise<void>
    catch(entity: Entity): Promise<void>
}