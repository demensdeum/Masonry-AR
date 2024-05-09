import { GeolocationControllerDelegate } from "./geolocationControllerDelegate.js"
import { GameGeolocationPosition } from "./gameGeolocationPosition.js"
import { GeolocationControllerInterface } from "./geolocationControllerInterface.js"

export class GeolocationController implements GeolocationControllerInterface {

    private delegate: GeolocationControllerDelegate

    constructor(delegate: GeolocationControllerDelegate) {
        this.delegate = delegate
    }

    public reassign(args: {delegate: GeolocationControllerDelegate}) {
        this.delegate = args.delegate
    }

    public askOnce() {
        const self = this
        navigator.geolocation.getCurrentPosition((position) => {
            self.delegate.geolocationControllerGeolocationDidReceiveGeolocationOnce(
                this,
                new GameGeolocationPosition(
                    position.coords.latitude, 
                    position.coords.longitude
                )
            )
        })
    }

    public trackPosition() {
        const self = this        
        navigator.geolocation.watchPosition((position) => {
            self.delegate.geolocationControllerDidGetPosition(
                self,
                new GameGeolocationPosition(
                    position.coords.latitude, 
                    position.coords.longitude
                )
            )
          },
          (error) => {
            if (error.code == error.PERMISSION_DENIED) {
                self.delegate.geolocationControllerGeolocationPermissionDenied(
                    self
                )
            }
            else {
                self.delegate.geolocationControllerGeolocationDidReceiveError(
                    self,
                    `${error.code}: ${error.message}`
                )
            }
          }          
        )        
    }
}