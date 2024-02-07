import { EntitiesController } from "./entitiesController.js";
import { Entity } from "./entity.js";

export interface EntitiesControllerDelegate {

    entitiesControllerDidFetchEntities(
        controller: EntitiesController, 
        entities: Entity[]
    ): void

}