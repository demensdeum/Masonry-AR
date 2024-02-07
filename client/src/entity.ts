import { int } from "./types.js";
import { GeolocationPosition } from "./geolocationPosition.js";

export class Entity {

    id: int
    type: string
    position: GeolocationPosition

    constructor(id: int, type: string, position: GeolocationPosition) {
        this.id = id
        this.type = type
        this.position = position
    }

    static fromJson(json: any): Entity {
        const id: int = json.id
        const type: string = json.type
        const position = new GeolocationPosition(json.latitude, json.longitude)

        return new Entity(
            id,
            type,
            position
        )
    }
}
