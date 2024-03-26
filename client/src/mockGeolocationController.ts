import { GeolocationControllerDelegate } from "./geolocationControllerDelegate.js";
import { GeolocationControllerInterface } from "./geolocationControllerInterface.js";
import { GameGeolocationPosition } from "./gameGeolocationPosition.js";

export class MockGeolocationController implements GeolocationControllerInterface {

    public delegate: GeolocationControllerDelegate

    private position = new GameGeolocationPosition(51.509865, -0.118092)
    private trackPositionTimeout = 100

    constructor(
        delegate: GeolocationControllerDelegate
    )
    {
        this.delegate = delegate
    }

    askPermission(): void {
        this.delegate.geolocationControllerGeolocationAccessGranted(
            this,
            this.position
        )
    }

    trackPosition(): void {
        this.trackPositionStep()
    }

    private trackPositionStep() {
        // this.position.latitude += 0.00002
        // this.position.longitude += 0.000008
        const self = this
        setTimeout(() => {
                self.trackPositionStep()
            },
            this.trackPositionTimeout
        )
        this.delegate.geolocationControllerDidGetPosition(
            this,
            this.position
        )
    }

}