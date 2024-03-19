import { int } from "./types.js";

export class ServerInfoEntry {
    public id: int;
    public key: string;
    public value: string;

    constructor(
        id: int,
        key: string,
        value: string
    ) {
        this.id = id
        this.key = key
        this.value = value
    }

    static fromJson(json: any): ServerInfoEntry {
        const id: int = json.id
        const key: string = json.key
        const value: string = json.value

        return new ServerInfoEntry(
            id,
            key,
            value
        )
    }    
}