import { GameGeolocationPosition } from "./gameGeolocationPosition.js"
import { Entity } from "./entity.js"
import { RequestResultCodes } from "./requestResultCodes.js"
import { EntitiesControllerDelegate } from "./entitiesControllerDelegate.js"
import { EntitiesRequestResult } from "./entitiesRequestResult.js"
import { debugPrint } from "./runtime.js"
import { EntitiesControllerInterface } from "./entitiesControllerInterface.js"

export class EntitiesController implements EntitiesControllerInterface {

    private delegate: EntitiesControllerDelegate

    constructor(
        delegate: EntitiesControllerDelegate
    )
    {
        this.delegate = delegate
    }

    public async getEntities(position: GameGeolocationPosition): Promise<void> {
        const url = `../server/entities.php?latitude=${position.latitude}&longitude=${position.longitude}`;

        try {
            const response = await fetch(url)

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`)
            }

            const jsonData: [any] = await response.json()

            const result = EntitiesRequestResult.fromJson(jsonData)

            const entities = result.entities

            if (result.code == RequestResultCodes.Success) {
                this.delegate.entitiesControllerDidFetchEntities(
                    this,
                    entities
                )
            }
            else {
                this.delegate.entitiesControllerDidNotFetchEntities(
                    this,
                    result.message
                )                
            }

        } catch (error) {
            console.error("Error fetching entities:", error);
        }
    }

    public async build(): Promise<void> {
        const url = `../server/build.php`;

        try {
            const response = await fetch(url)

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`)
            }

            const jsonData: any = await response.json()

            const result = EntitiesRequestResult.fromJson(jsonData)
            const entity = result.entities[0]

            if (result.code == RequestResultCodes.Success) {
                this.delegate.entitiesControllerDidBuildEntity(
                    this,
                    entity
                )    
            }
            else {
                this.delegate.entitiesControllerDidNotBuildEntityError(
                    this,
                    result.message
                )
            }

        } catch (error) {
            console.error("Error fetching entities:", error);
        }
    }

    public async destroy(entity: Entity): Promise<void> {
        const url = `../server/destroy.php?uuid=${entity.uuid}`;

        debugPrint(`destroy: ${entity.uuid}`)

        try {
            const response = await fetch(url)

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`)
            }

            const jsonData: any = await response.json()

            const result = EntitiesRequestResult.fromJson(jsonData)

            if (result.code == RequestResultCodes.Success) {
                this.delegate.entitiesControllerDidDestroyEntity(
                    this,
                    entity
                )    
            }
            else {
                this.delegate.entitiesControllerDidNotDestroyEntityError(
                    this,
                    entity,
                    result.message
                )
            }

        } catch (error) {
            console.error("Error fetching entities:", error);
        }
    }

    public async catch(entity: Entity): Promise<void> {
        const url = `../server/catchEntity.php?uuid=${entity.uuid}`;

        debugPrint(`catch: ${entity.uuid}`)

        try {
            const response = await fetch(url)

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`)
            }

            const jsonData: any = await response.json()

            const result = EntitiesRequestResult.fromJson(jsonData)

            if (result.code == RequestResultCodes.Success) {
                this.delegate.entitiesControllerDidCatchEntity(
                    this,
                    entity
                )    
            }
            else {
                this.delegate.entitiesControllerDidNotCatchEntity(
                    this,
                    entity,
                    result.message
                )
            }

        } catch (error) {
            console.error("Error fetching entities:", error);
        }
    }
}