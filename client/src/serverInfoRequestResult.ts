import { ServerInfoEntry } from "./serverInfoEntry.js"
import { int } from "./types.js"

export class ServerInfoRequestResult {
    code: int
    message: string
    entities: ServerInfoEntry[]

    constructor(
        code: int,
        message: string,
        entities: ServerInfoEntry[]
    ) {
        this.code = code
        this.message = message
        this.entities = entities
    }

    static fromJson(json: any): ServerInfoRequestResult {
        const code: int = json.code
        const message: string = json.message
        const entries: ServerInfoEntry[] = json.entities.map((data: any) => ServerInfoEntry.fromJson(data))

        return new ServerInfoRequestResult(
            code,
            message,
            entries
        )
    }    
}