import { GeolocationPosition } from "./geolocationPosition.js";
import { Entity } from "./entity.js";
import { debugPrint } from "./runtime.js";
import { EntitiesControllerDelegate } from "./entitiesControllerDelegate.js";

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
}