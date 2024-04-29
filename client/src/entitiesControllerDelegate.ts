import { EntitiesControllerInterface } from "./entitiesControllerInterface.js";
import { Entity } from "./entity.js";

export interface EntitiesControllerDelegate {

    entitiesControllerDidFetchEntities(
        controller: EntitiesControllerInterface, 
        entities: Entity[]
    ): void

    entitiesControllerDidNotFetchEntities(
        controller: EntitiesControllerInterface,
        message: string
    ): void      

    entitiesControllerDidCatchEntity(
        controller: EntitiesControllerInterface,
        entity: Entity
    ): void

    entitiesControllerDidNotCatchEntity(
        controller: EntitiesControllerInterface,
        entity: Entity,
        message: string
    ): void

    entitiesControllerDidBuildEntity(
        controller: EntitiesControllerInterface,
        entity: Entity
    ): void

    entitiesControllerDidNotBuildEntityError(
        controller: EntitiesControllerInterface,
        message: string
    ): void    

    entitiesControllerDidDestroyEntity(
        controller: EntitiesControllerInterface,
        entity: Entity
    ): void

    entitiesControllerDidNotDestroyEntityError(
        controller: EntitiesControllerInterface,
        entity: Entity,
        message: string
    ): void       
}