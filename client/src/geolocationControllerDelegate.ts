import { GeolocationControllerInterface } from "./geolocationControllerInterface.js"
import { GameGeolocationPosition } from "./gameGeolocationPosition.js"

export interface GeolocationControllerDelegate {
    geolocationControllerDidGetPosition(
        controller: GeolocationControllerInterface,
        position: GameGeolocationPosition
    ): void

    geolocationControllerGeolocationDidReceiveGeolocationOnce(
        controller: GeolocationControllerInterface,
        position: GameGeolocationPosition
    ): void

    geolocationControllerGeolocationDidReceiveError(
        controller: GeolocationControllerInterface,
        error: string
    ): void
}