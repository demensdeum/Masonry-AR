import { GeolocationControllerDelegate } from "./geolocationControllerDelegate.js"
import { GeolocationPosition } from "./geolocationPosition.js"
import { debugPrint } from "./runtime.js"

export class GeolocationController {

    private delegate: GeolocationControllerDelegate

    constructor(delegate: GeolocationControllerDelegate) {
        this.delegate = delegate
    }

    public trackPosition() {
        const self = this
        navigator.geolocation.watchPosition((position) => {
            self.delegate.geolocationControllerDidGetPosition(
                self,
                new GeolocationPosition(
                    position.coords.latitude, 
                    position.coords.longitude
                )
            )
          }
        )
    }
}