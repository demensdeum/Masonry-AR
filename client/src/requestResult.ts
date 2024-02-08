import { int } from "./types.js"

export class RequestResult {
    code: int
    message: string

    constructor(
        code: int,
        message: string
    ) {
        this.code = code
        this.message = message
    }

    static fromJson(json: any): RequestResult {
        const code: int = json.code
        const message: string = json.message

        return new RequestResult(
            code,
            message
        )
    }    
}