import { GeolocationPosition } from "./geolocationPosition.js";
import { Entity } from "./entity.js";
import { RequestResultCodes } from "./requestResultCodes.js";
import { EntitiesControllerDelegate } from "./entitiesControllerDelegate.js";
import { RequestResult } from "./requestResult.js";

export class EntitiesController {

    private delegate: EntitiesControllerDelegate

    constructor(
        delegate: EntitiesControllerDelegate
    )
    {
        this.delegate = delegate
    }

    public async getEntities(position: GeolocationPosition) {
        const url = `http://localhost/Masonry-AR/server/entities.php?latitude=${position.latitude}&longitude=${position.longitude}`;

        try {
            const response = await fetch(url)

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`)
            }

            const jsonData: [any] = await response.json()

            const entities = jsonData.map((data: any) => Entity.fromJson(data))

            this.delegate.entitiesControllerDidFetchEntities(
                this,
                entities
            )

        } catch (error) {
            console.error("Error fetching entities:", error);
        }
    }

    public async build() {
        const url = `http://localhost/Masonry-AR/server/build.php`;

        try {
            const response = await fetch(url)

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`)
            }

            const jsonData: any = await response.json()

            const result = RequestResult.fromJson(jsonData)
            const entity =result.entities[0]

            if (result.code == RequestResultCodes.Success) {
                this.delegate.entitiesControllerDidBuildEntity(
                    this,
                    entity
                )    
            }
            else {
                this.delegate.entitiesControllerDidNotBuildEntity(
                    this,
                    entity,
                    result.message
                )
            }

        } catch (error) {
            console.error("Error fetching entities:", error);
        }
    }

    public async catch(entity: Entity) {
        const url = `http://localhost/Masonry-AR/server/catchEntity.php?uuid=${entity.uuid}`;

        try {
            const response = await fetch(url)

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`)
            }

            const jsonData: any = await response.json()

            const result = RequestResult.fromJson(jsonData)

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