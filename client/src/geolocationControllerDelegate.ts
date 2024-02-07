import { GeolocationController } from "./geolocationController.js"
import { GeolocationPosition } from "./geolocationPosition.js"

export interface GeolocationControllerDelegate {
    geolocationControllerDidGetPosition(
        controller: GeolocationController,
        position: GeolocationPosition
    ): void
}