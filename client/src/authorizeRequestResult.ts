import { int } from "./types.js"

export class AuthorizeRequestResult {
    code: int
    message: string
    heroUUID: string

    constructor(
        code: int,
        message: string,
        heroUUID: string
    ) {
        this.code = code
        this.message = message
        this.heroUUID = heroUUID
    }

    static fromJson(json: any): AuthorizeRequestResult {
        const code: int = json.code
        const message: string = json.message
        const heroUUID: string = json.heroUUID

        return new AuthorizeRequestResult(
            code,
            message,
            heroUUID
        )
    }
}