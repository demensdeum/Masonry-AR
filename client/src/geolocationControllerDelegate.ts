import { GeolocationController } from "./geolocationController.js"
import { GeolocationPosition } from "./geolocationPosition.js"

export interface GeolocationControllerDelegate {
    geolocationControllerDidGetPosition(
        controller: GeolocationController,
        position: GeolocationPosition
    ): void

    geolocationControllerGeolocationAccessGranted(
        controller: GeolocationController,
        position: GeolocationPosition
    ): void

    geolocationControllerGeolocationDidReceiveError(
        controller: GeolocationController,
        error: string
    ): void
}