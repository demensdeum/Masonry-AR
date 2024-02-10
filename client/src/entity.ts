import { int } from "./types.js";
import { GeolocationPosition } from "./geolocationPosition.js";

export class Entity {

    id: int
    uuid: string
    type: string
    balance: int
    position: GeolocationPosition
    isVisible: boolean

    constructor(
        id: int,
        uuid: string,
        type: string,
        balance: int,
        position: GeolocationPosition,
        isVisible: boolean
    ) {
        this.id = id
        this.uuid = uuid
        this.type = type
        this.balance = balance
        this.position = position
        this.isVisible = isVisible
    }

    static fromJson(json: any): Entity {
        const id: int = json.id
        const uuid: string = json.uuid
        const type: string = json.type
        const balance: int = json.balance
        const position = new GeolocationPosition(
            json.latitude,
            json.longitude
        )
        const isVisible = json.isVisible

        return new Entity(
            id,
            uuid,
            type,
            balance,
            position,
            isVisible
        )
    }
}
