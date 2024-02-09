import { EntitiesController } from "./entitiesController.js";
import { Entity } from "./entity.js";

export interface EntitiesControllerDelegate {

    entitiesControllerDidFetchEntities(
        controller: EntitiesController, 
        entities: Entity[]
    ): void

    entitiesControllerDidCatchEntity(
        controller: EntitiesController,
        entity: Entity
    ): void

    entitiesControllerDidNotCatchEntity(
        controller: EntitiesController,
        entity: Entity,
        message: string
    ): void

    entitiesControllerDidBuildEntity(
        controller: EntitiesController,
        entity: Entity
    ): void

    entitiesControllerDidNotBuildEntity(
        controller: EntitiesController,
        entity: Entity,
        message: string
    ): void    
}