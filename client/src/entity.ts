import { int } from "./types.js";
import { GeolocationPosition } from "./geolocationPosition.js";

export class Entity {

    id: int
    uuid: string
    name: string
    order: string
    type: string
    model: string
    balance: int
    position: GeolocationPosition

    constructor(
        id: int,
        uuid: string,
        name: string,
        order: string,
        type: string,
        model: string,
        balance: int,
        position: GeolocationPosition
    ) {
        this.id = id
        this.uuid = uuid
        this.name = name
        this.order = order
        this.type = type
        this.model = model
        this.balance = balance
        this.position = position
    }

    static fromJson(json: any): Entity {
        const id: int = json.id
        const uuid: string = json.uuid
        const name: string = json.name
        const order: string = json.order
        const type: string = json.type
        const model: string = json.model
        const balance: int = json.balance
        const position = new GeolocationPosition(
            json.latitude,
            json.longitude
        )

        return new Entity(
            id,
            uuid,
            name,
            order,
            type,
            model,
            balance,
            position
        )
    }
}
