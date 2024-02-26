import { int } from "./types.js";
import { GeolocationPosition } from "./geolocationPosition.js";

export class Entity {

    id: int
    uuid: string
    order: string
    type: string
    skin: string
    balance: int
    position: GeolocationPosition

    constructor(
        id: int,
        uuid: string,
        order: string,
        type: string,
        skin: string,
        balance: int,
        position: GeolocationPosition
    ) {
        this.id = id
        this.uuid = uuid
        this.order = order
        this.type = type
        this.skin = skin
        this.balance = balance
        this.position = position
    }

    static fromJson(json: any): Entity {
        const id: int = json.id
        const uuid: string = json.uuid
        const order: string = json.order
        const type: string = json.type
        const skin: string = json.skin
        const balance: int = json.balance
        const position = new GeolocationPosition(
            json.latitude,
            json.longitude
        )

        return new Entity(
            id,
            uuid,
            order,
            type,
            skin,
            balance,
            position
        )
    }
}
