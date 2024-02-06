import { int } from "./types"

export class SceneObjectCommand {
    readonly name: String
    readonly originalTime: int
    readonly nextCommandName?: String

    time: int

    constructor(
        name: String,
        time: int,
        nextCommandName?: String
    )
    {
        this.name = name
        this.time = time
        this.originalTime = time
        if (nextCommandName != null) {
            this.nextCommandName = nextCommandName
        }
    }

    public reset() {
        this.time = this.originalTime
    }

    public step() {
        this.time -= 1
    }

    public isExpired() {
        return this.time < 1
    }
}