import { float } from "./types.js"

export class GeolocationPosition {
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
}