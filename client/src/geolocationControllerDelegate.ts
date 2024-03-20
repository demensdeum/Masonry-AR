import { GeolocationControllerInterface } from "./geolocationControllerInterface.js"
import { GameGeolocationPosition } from "./geolocationPosition.js"

export interface GeolocationControllerDelegate {
    geolocationControllerDidGetPosition(
        controller: GeolocationControllerInterface,
        position: GameGeolocationPosition
    ): void

    geolocationControllerGeolocationAccessGranted(
        controller: GeolocationControllerInterface,
        position: GameGeolocationPosition
    ): void

    geolocationControllerGeolocationDidReceiveError(
        controller: GeolocationControllerInterface,
        error: string
    ): void
}