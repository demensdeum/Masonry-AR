import { Entity } from "./entity.js"
import { int } from "./types.js"

export class EntitiesRequestResult {
    code: int
    message: string
    entities: Entity[]

    constructor(
        code: int,
        message: string,
        entities: Entity[]
    ) {
        this.code = code
        this.message = message
        this.entities = entities
    }

    static fromJson(json: any): EntitiesRequestResult {
        const code: int = json.code
        const message: string = json.message
        const entities: Entity[] = json.entities.map((data: any) => Entity.fromJson(data))

        return new EntitiesRequestResult(
            code,
            message,
            entities
        )
    }    
}