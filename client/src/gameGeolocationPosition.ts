import { GameVector3 } from "./gameVector3.js"
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

    public movedPosition(
        targetPosition: GameGeolocationPosition,
        speed: float
    ) {
        const movedVector = new GameVector3(
            this.longitude,
            0,
            this.latitude
        ).movedVector(
            new GameVector3(
                targetPosition.longitude,
                0,
                targetPosition.latitude
            ),
            speed
        )

        return new GameGeolocationPosition(
            movedVector.z,
            movedVector.x
        )
    }

    public subtract(position: GameGeolocationPosition) {
        const latitude = this.latitude - position.latitude
        const longitude = this.longitude - position.longitude
        return new GameGeolocationPosition(
            latitude,
            longitude
        )
    }    

    public clone(): GameGeolocationPosition {
        return new GameGeolocationPosition(
            this.latitude,
            this.longitude
        )
    }

    public near(geolocation: GameGeolocationPosition): boolean {
        const R = 6371e3;
        const lat1 = this.latitude * Math.PI / 180;
        const lat2 = geolocation.latitude * Math.PI / 180;
        const deltaLat = (geolocation.latitude - this.latitude) * Math.PI / 180;
        const deltaLon = (geolocation.longitude - this.longitude) * Math.PI / 180;
        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        if (distance <= 100) {
            return true;
        } else {
            return false;
        }
    }    

    public populate(geolocation: GameGeolocationPosition) {
        this.latitude = geolocation.latitude
        this.longitude = geolocation.longitude
    }
}