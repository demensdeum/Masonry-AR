import { int } from "./types.js";
import { GameGeolocationPosition } from "./gameGeolocationPosition.js";
import { UUID } from "./types.js";

export class Entity {

    id: int
    uuid: UUID
    name: string
    ownerName: string
    order: string
    type: string
    model: string
    balance: int
    position: GameGeolocationPosition

    constructor(
        id: int,
        uuid: UUID,
        name: string,
        ownerName: string,
        order: string,
        type: string,
        model: string,
        balance: int,
        position: GameGeolocationPosition
    ) {
        this.id = id
        this.uuid = uuid
        this.name = name
        this.ownerName = ownerName
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
        const ownerName: string = json.ownerName
        const order: string = json.order
        const type: string = json.type
        const model: string = json.model
        const balance: int = json.balance
        const position = new GameGeolocationPosition(
            json.latitude,
            json.longitude
        )

        return new Entity(
            id,
            uuid,
            name,
            ownerName,
            order,
            type,
            model,
            balance,
            position
        )
    }
}
