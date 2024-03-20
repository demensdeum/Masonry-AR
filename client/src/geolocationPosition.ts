import { float } from "./types.js"

export class GameGeolocationPosition {
    latitude: float
    longitude: float

    constructor(
        latitude: float,
        longitude: float
    )
    {
        this.latitude = latitude
        this.longitude = longitude
    }

    public clone(): GameGeolocationPosition {
        return new GameGeolocationPosition(
            this.latitude,
            this.longitude
        )
    }
}